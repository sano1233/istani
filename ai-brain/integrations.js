#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

class IntegrationManager {
  constructor() {
    this.config = {
      n8n: {
        webhookUrl: process.env.N8N_WEBHOOK_URL || '',
        apiKey: process.env.N8N_API_KEY || ''
      },
      hyperswitch: {
        webhookUrl: process.env.HYPERSWITCH_WEBHOOK_URL || '',
        apiKey: process.env.HYPERSWITCH_API_KEY || ''
      },
      supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        projectId: process.env.SUPABASE_PROJECT_ID || ''
      },
      github: {
        token: process.env.GITHUB_TOKEN || '',
        repo: process.env.GITHUB_REPOSITORY || 'sano1233/istani'
      }
    };
  }

  async sendWebhook(service, event, data) {
    const config = this.config[service];
    if (!config || !config.webhookUrl) {
      console.log(`⚠️  ${service} webhook not configured`);
      return { success: false, message: 'Webhook not configured' };
    }

    return new Promise((resolve) => {
      const url = new URL(config.webhookUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            body
          });
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, message: error.message });
      });

      req.write(JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...data
      }));

      req.end();
    });
  }

  async notifyN8N(event, data) {
    return await this.sendWebhook('n8n', event, {
      source: 'github',
      repository: this.config.github.repo,
      ...data
    });
  }

  async notifyHyperswitch(event, data) {
    return await this.sendWebhook('hyperswitch', event, {
      source: 'github',
      repository: this.config.github.repo,
      ...data
    });
  }

  async deploySupabaseMigration(migrationFile) {
    const { url, key, projectId } = this.config.supabase;
    if (!url || !key) {
      console.log('⚠️  Supabase not configured');
      return { success: false, message: 'Supabase not configured' };
    }

    try {
      // Use Supabase CLI if available
      const result = execSync(
        `npx supabase db push --db-url ${url} --password ${process.env.SUPABASE_DB_PASSWORD || ''}`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      return { success: true, message: result };
    } catch (e) {
      // Fallback to API
      console.log('Using Supabase API fallback...');
      return await this.sendWebhook('supabase', 'migration', {
        migrationFile,
        projectId
      });
    }
  }

  async syncRepositories(sourceRepo, targetRepos) {
    const repos = Array.isArray(targetRepos) ? targetRepos : [targetRepos];
    const results = [];

    for (const targetRepo of repos) {
      try {
        const [owner, repo] = targetRepo.split('/');
        const result = execSync(
          `git push https://${this.config.github.token}@github.com/${targetRepo}.git HEAD:main --force || git push https://${this.config.github.token}@github.com/${targetRepo}.git HEAD:master --force`,
          { encoding: 'utf8', stdio: 'pipe' }
        );
        results.push({ repo: targetRepo, success: true, message: result });
        console.log(`✅ Synced to ${targetRepo}`);
      } catch (e) {
        results.push({ repo: targetRepo, success: false, message: e.message });
        console.log(`⚠️  Failed to sync to ${targetRepo}: ${e.message}`);
      }
    }

    return results;
  }

  async handlePRMerged(prData) {
    const results = {
      n8n: await this.notifyN8N('pr_merged', {
        prNumber: prData.number,
        title: prData.title,
        author: prData.user?.login,
        mergedAt: prData.merged_at
      }),
      hyperswitch: await this.notifyHyperswitch('pr_merged', {
        prNumber: prData.number,
        title: prData.title
      })
    };

    return results;
  }

  async handleDeployment(deploymentData) {
    const results = {
      n8n: await this.notifyN8N('deployment', {
        environment: deploymentData.environment || 'production',
        commit: deploymentData.sha,
        branch: deploymentData.ref,
        status: 'success'
      }),
      hyperswitch: await this.notifyHyperswitch('deployment', {
        environment: deploymentData.environment || 'production',
        commit: deploymentData.sha
      }),
      supabase: deploymentData.migrations ? 
        await this.deploySupabaseMigration(deploymentData.migrations) :
        { success: true, message: 'No migrations to deploy' }
    };

    return results;
  }
}

// CLI interface
if (require.main === module) {
  const [, , command, ...args] = process.argv;
  const manager = new IntegrationManager();

  async function main() {
    switch (command) {
      case 'n8n':
        const n8nEvent = args[0] || 'test';
        const result = await manager.notifyN8N(n8nEvent, { test: true });
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'hyperswitch':
        const hsEvent = args[0] || 'test';
        const hsResult = await manager.notifyHyperswitch(hsEvent, { test: true });
        console.log(JSON.stringify(hsResult, null, 2));
        break;

      case 'sync':
        const targetRepos = args.length > 0 ? args : ['sano1233/istani'];
        const syncResults = await manager.syncRepositories(process.env.GITHUB_REPOSITORY, targetRepos);
        console.log(JSON.stringify(syncResults, null, 2));
        break;

      case 'deploy':
        const deployResult = await manager.handleDeployment({
          sha: args[0] || process.env.GITHUB_SHA || 'HEAD',
          ref: args[1] || process.env.GITHUB_REF || 'main',
          environment: args[2] || 'production'
        });
        console.log(JSON.stringify(deployResult, null, 2));
        break;

      default:
        console.log('Usage: node ai-brain/integrations.js <command> [args]');
        console.log('Commands:');
        console.log('  n8n <event>        - Send event to n8n');
        console.log('  hyperswitch <event> - Send event to hyperswitch');
        console.log('  sync [repos...]    - Sync repositories');
        console.log('  deploy [sha] [ref] [env] - Handle deployment');
    }
  }

  main().catch(console.error);
}

module.exports = IntegrationManager;
