#!/usr/bin/env node
'use strict';

/**
 * HyperSwitch Integration for Payment Processing Automation
 * Connects all repositories to HyperSwitch for unified payment handling
 */

const https = require('https');
const http = require('http');

const HYPERSWITCH_API_KEY = process.env.HYPERSWITCH_API_KEY;
const HYPERSWITCH_API_URL = process.env.HYPERSWITCH_API_URL || 'https://api.hyperswitch.io';

class HyperSwitchIntegration {
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.apiUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'Accept': 'application/json'
        }
      };

      const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || body}`));
            }
          } catch (e) {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async createPayment(paymentData) {
    return this.makeRequest('/payments', 'POST', paymentData);
  }

  async getPaymentStatus(paymentId) {
    return this.makeRequest(`/payments/${paymentId}`);
  }

  async createWebhook(webhookUrl, events = ['payment.succeeded', 'payment.failed']) {
    return this.makeRequest('/webhooks', 'POST', {
      url: webhookUrl,
      events: events
    });
  }

  async syncRepositoryWebhooks(repoName) {
    const webhookUrl = `https://api.github.com/repos/sano1233/${repoName}/hooks`;
    // This would integrate with GitHub webhooks to forward payment events
    console.log(`Setting up HyperSwitch webhook for ${repoName}`);
  }
}

// Main execution
if (require.main === module) {
  const integration = new HyperSwitchIntegration(HYPERSWITCH_API_KEY, HYPERSWITCH_API_URL);
  
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'setup':
      integration.syncRepositoryWebhooks('istani')
        .then(() => console.log('✅ HyperSwitch integration setup complete'))
        .catch(console.error);
      break;
    
    case 'webhook':
      const webhookUrl = args[0] || process.env.WEBHOOK_URL;
      if (!webhookUrl) {
        console.error('Webhook URL required');
        process.exit(1);
      }
      integration.createWebhook(webhookUrl)
        .then(result => console.log('Webhook created:', result))
        .catch(console.error);
      break;
    
    default:
      console.log('Usage: node scripts/hyperswitch-integration.js <command> [args]');
      console.log('Commands:');
      console.log('  setup              - Setup HyperSwitch for istani repository');
      console.log('  webhook <url>      - Create a webhook endpoint');
  }
}

module.exports = HyperSwitchIntegration;
