#!/usr/bin/env node
/**
 * Secrets Health Check CLI
 *
 * Usage: node config/health-check.js
 *
 * Validates all configured secrets and provides health status report.
 */

const config = require('./index');
const secrets = require('./secrets');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
  console.log('\n' + colorize('═'.repeat(70), 'cyan'));
  console.log(colorize(`  ${text}`, 'bright'));
  console.log(colorize('═'.repeat(70), 'cyan'));
}

function printSection(text) {
  console.log('\n' + colorize(`▸ ${text}`, 'cyan'));
  console.log(colorize('─'.repeat(70), 'gray'));
}

function printSuccess(text) {
  console.log(`  ${colorize('✓', 'green')} ${text}`);
}

function printWarning(text) {
  console.log(`  ${colorize('⚠', 'yellow')} ${colorize(text, 'yellow')}`);
}

function printError(text) {
  console.log(`  ${colorize('✗', 'red')} ${colorize(text, 'red')}`);
}

function printInfo(label, value) {
  console.log(`  ${colorize(label + ':', 'cyan')} ${value}`);
}

function main() {
  try {
    printHeader('ISTANI PROJECT - SECRETS HEALTH CHECK');

    // Environment info
    printSection('Environment');
    printInfo('NODE_ENV', config.env);
    printInfo('Repository', config.github.repo);

    // Secrets health
    const health = secrets.getSecretsHealth();
    printSection('Secrets Status');
    printInfo('Total Secrets', health.total);
    printInfo('Configured', health.configured);
    printInfo('Missing', health.missing);

    if (health.healthy) {
      printSuccess('All required secrets are configured');
    } else {
      printError('Some required secrets are missing');
    }

    // Configured secrets
    if (health.details.configured.length > 0) {
      printSection('Configured Secrets');
      health.details.configured.forEach(secret => {
        printSuccess(secret);
      });
    }

    // Missing secrets
    if (health.details.missing.length > 0) {
      printSection('Missing Secrets (Optional)');
      health.details.missing.forEach(secret => {
        const def = secrets.SECRET_DEFINITIONS[secret];
        console.log(`  ${colorize('○', 'gray')} ${secret}`);
        console.log(`    ${colorize(def.description, 'gray')}`);
      });
    }

    // Errors
    if (health.errors.length > 0) {
      printSection('Errors');
      health.errors.forEach(error => {
        printError(error);
      });
    }

    // Warnings
    if (health.warnings.length > 0) {
      printSection('Warnings');
      health.warnings.forEach(warning => {
        printWarning(warning);
      });
    }

    // Services status
    const configHealth = config.healthCheck();
    printSection('Enabled Services');
    printInfo('Total Services', configHealth.services.total);
    printInfo('AI Providers', configHealth.services.ai);
    printInfo('Deployment', configHealth.services.deployment);
    printInfo('GitHub', configHealth.services.github);

    if (configHealth.details.aiProviders.length > 0) {
      console.log('\n  AI Providers:');
      configHealth.details.aiProviders.forEach(provider => {
        printSuccess(provider.toUpperCase());
      });
    }

    // Overall status
    printSection('Overall Status');
    if (health.healthy && configHealth.status === 'healthy') {
      printSuccess('System is healthy and ready to use');
      console.log();
      process.exit(0);
    } else {
      printWarning('System is running in degraded mode');
      printInfo('Status', configHealth.status);
      console.log();
      process.exit(1);
    }

  } catch (error) {
    printHeader('ERROR');
    printError(error.message);
    console.log();
    if (error.stack) {
      console.log(colorize(error.stack, 'gray'));
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
