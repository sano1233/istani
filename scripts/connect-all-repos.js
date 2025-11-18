#!/usr/bin/env node
'use strict';

/**
 * Connect All Repositories to istani
 * Sets up webhooks and automation for all repositories
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_REPO = 'sano1233/istani';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

async function getRepositories() {
  try {
    const output = execSync(
      `gh repo list sano1233 --limit 100 --json name --jq '.[].name'`,
      { encoding: 'utf8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch repositories:', error.message);
    return [];
  }
}

async function setupWebhook(repo) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 
    `https://api.github.com/repos/${TARGET_REPO}/hooks`;
  
  console.log(`  Setting up webhook for ${repo}...`);
  
  try {
    // Check if webhook already exists
    const existing = execSync(
      `gh api repos/sano1233/${repo}/hooks --jq '.[] | select(.config.url | contains("n8n")) | .id'`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    
    if (existing) {
      console.log(`    ✅ Webhook already exists`);
      return true;
    }
    
    // Create webhook
    const webhookConfig = {
      name: 'web',
      active: true,
      events: [
        'push',
        'pull_request',
        'issues',
        'issue_comment'
      ],
      config: {
        url: webhookUrl,
        content_type: 'json',
        insecure_ssl: '0'
      }
    };
    
    execSync(
      `gh api repos/sano1233/${repo}/hooks -X POST --input -`,
      {
        input: JSON.stringify(webhookConfig),
        encoding: 'utf8',
        stdio: 'pipe'
      }
    );
    
    console.log(`    ✅ Webhook created`);
    return true;
  } catch (error) {
    console.log(`    ⚠️  Could not create webhook: ${error.message}`);
    return false;
  }
}

async function enableActions(repo) {
  console.log(`  Enabling GitHub Actions for ${repo}...`);
  
  try {
    // Actions are enabled by default, just verify
    const actions = execSync(
      `gh api repos/sano1233/${repo}/actions/permissions --jq '.enabled'`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    
    if (actions === 'true') {
      console.log(`    ✅ Actions already enabled`);
    } else {
      execSync(
        `gh api repos/sano1233/${repo}/actions/permissions -X PUT -f enabled=true`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      console.log(`    ✅ Actions enabled`);
    }
    return true;
  } catch (error) {
    console.log(`    ⚠️  Could not enable actions: ${error.message}`);
    return false;
  }
}

async function connectRepository(repo) {
  if (repo === 'istani') {
    console.log(`⏭️  Skipping ${repo} (target repository)`);
    return;
  }
  
  console.log(`\n🔗 Connecting ${repo}...`);
  
  const webhookOk = await setupWebhook(repo);
  const actionsOk = await enableActions(repo);
  
  if (webhookOk && actionsOk) {
    console.log(`✅ ${repo} connected successfully`);
    return true;
  } else {
    console.log(`⚠️  ${repo} partially connected`);
    return false;
  }
}

async function main() {
  console.log('🚀 Connecting All Repositories to istani');
  console.log('==========================================\n');
  
  const repos = await getRepositories();
  
  if (repos.length === 0) {
    console.log('❌ No repositories found');
    process.exit(1);
  }
  
  console.log(`Found ${repos.length} repositories\n`);
  
  const results = {
    connected: [],
    failed: []
  };
  
  for (const repo of repos) {
    const success = await connectRepository(repo);
    if (success) {
      results.connected.push(repo);
    } else {
      results.failed.push(repo);
    }
  }
  
  // Save connection status
  const configPath = path.join(__dirname, '..', '.automation-config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  config.connectedRepositories = results.connected;
  config.connectionStatus = {
    total: repos.length,
    connected: results.connected.length,
    failed: results.failed.length,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Connection Summary');
  console.log('='.repeat(50));
  console.log(`✅ Connected: ${results.connected.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📦 Total: ${repos.length}`);
  
  if (results.connected.length > 0) {
    console.log('\n✅ Connected repositories:');
    results.connected.forEach(repo => console.log(`  • ${repo}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed repositories:');
    results.failed.forEach(repo => console.log(`  • ${repo}`));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Connection process complete!');
  console.log('\nNext steps:');
  console.log('1. Verify webhooks in repository settings');
  console.log('2. Check GitHub Actions are enabled');
  console.log('3. Run: ./scripts/setup-automation.sh');
  console.log('4. Monitor at: https://github.com/sano1233/istani/actions');
}

main().catch(console.error);
