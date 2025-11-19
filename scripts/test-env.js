#!/usr/bin/env node

/**
 * Comprehensive Environment Testing Script
 *
 * Tests all environments extensively:
 * - Variable validation
 * - API connectivity tests
 * - Service health checks
 * - Configuration consistency
 *
 * Usage:
 *   node scripts/test-env.js [--iterations=1000] [--mode=all|quick]
 *   npm run test-env
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const config = require('../config/index');
// const { checkEnvironment } = require('../lib/env-validation');

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80));
}

// Test statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  startTime: Date.now(),
  tests: [],
};

function recordTest(name, status, message = '', duration = 0) {
  stats.total++;
  stats.tests.push({ name, status, message, duration });

  switch (status) {
    case 'pass':
      stats.passed++;
      log(`  ✓ ${name} (${duration}ms)`, 'green');
      break;
    case 'fail':
      stats.failed++;
      log(`  ✗ ${name} - ${message}`, 'red');
      break;
    case 'skip':
      stats.skipped++;
      log(`  ○ ${name} - ${message}`, 'yellow');
      break;
    case 'warn':
      stats.warnings++;
      log(`  ⚠ ${name} - ${message}`, 'yellow');
      break;
  }
}

// Test: Environment detection
async function testEnvironmentDetection() {
  logSection('TEST: ENVIRONMENT DETECTION');

  const start = Date.now();
  const env = process.env.NODE_ENV || 'development';
  const isValid = ['development', 'production', 'test'].includes(env);

  if (isValid) {
    recordTest('Environment detection', 'pass', '', Date.now() - start);
    log(`    Environment: ${env}`, 'cyan');
  } else {
    recordTest('Environment detection', 'fail', `Invalid NODE_ENV: ${env}`, Date.now() - start);
  }

  // Test config module
  const start2 = Date.now();
  try {
    const configEnv = config.env;
    const isDev = config.isDevelopment;
    const isProd = config.isProduction;

    recordTest('Config module detection', 'pass', '', Date.now() - start2);
    log(`    Config env: ${configEnv}`, 'cyan');
    log(`    isDevelopment: ${isDev}`, 'cyan');
    log(`    isProduction: ${isProd}`, 'cyan');
  } catch (error) {
    recordTest('Config module detection', 'fail', error.message, Date.now() - start2);
  }
}

// Test: Required variables
async function testRequiredVariables() {
  logSection('TEST: REQUIRED VARIABLES');

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const varName of required) {
    const start = Date.now();
    const value = process.env[varName];

    if (value && value.length > 10) {
      recordTest(`Required: ${varName}`, 'pass', '', Date.now() - start);
    } else {
      recordTest(`Required: ${varName}`, 'fail', 'Not configured or too short', Date.now() - start);
    }
  }
}

// Test: Supabase connectivity
async function testSupabaseConnection() {
  logSection('TEST: SUPABASE CONNECTION');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    recordTest('Supabase connection', 'skip', 'Credentials not configured');
    return;
  }

  const start = Date.now();
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      recordTest('Supabase REST API', 'pass', '', Date.now() - start);
    } else {
      recordTest('Supabase REST API', 'fail', `HTTP ${response.status}`, Date.now() - start);
    }
  } catch (error) {
    recordTest('Supabase REST API', 'fail', error.message, Date.now() - start);
  }
}

// Test: AI Services
async function testAIServices() {
  logSection('TEST: AI SERVICES');

  const aiServices = [
    { name: 'OpenAI', key: 'OPENAI_API_KEY', prefix: 'sk-' },
    { name: 'Gemini', key: 'GEMINI_API_KEY', minLength: 20 },
    { name: 'Anthropic', key: 'ANTHROPIC_API_KEY', prefix: 'sk-ant-' },
    { name: 'Qwen', key: 'QWEN_API_KEY', minLength: 20 },
  ];

  for (const service of aiServices) {
    const start = Date.now();
    const value = process.env[service.key];

    if (!value) {
      recordTest(`${service.name} API key`, 'skip', 'Not configured');
      continue;
    }

    let isValid = true;
    if (service.prefix && !value.startsWith(service.prefix)) {
      isValid = false;
    }
    if (service.minLength && value.length < service.minLength) {
      isValid = false;
    }

    if (isValid) {
      recordTest(`${service.name} API key`, 'pass', '', Date.now() - start);
    } else {
      recordTest(`${service.name} API key`, 'fail', 'Invalid format', Date.now() - start);
    }
  }

  // Test config AI providers
  const start = Date.now();
  try {
    const providers = config.getAIProviders();
    recordTest('Config AI providers', 'pass', `${providers.length} enabled`, Date.now() - start);
    providers.forEach((p) => {
      log(`    - ${p.name}: ${p.model}`, 'cyan');
    });
  } catch (error) {
    recordTest('Config AI providers', 'fail', error.message, Date.now() - start);
  }
}

// Test: Stripe configuration
async function testStripeConfig() {
  logSection('TEST: STRIPE CONFIGURATION');

  const stripeVars = [
    { name: 'Publishable Key', key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', prefix: 'pk_' },
    { name: 'Secret Key', key: 'STRIPE_SECRET_KEY', prefix: 'sk_' },
    { name: 'Webhook Secret', key: 'STRIPE_WEBHOOK_SECRET', prefix: 'whsec_' },
  ];

  let hasAny = false;
  for (const stripe of stripeVars) {
    const start = Date.now();
    const value = process.env[stripe.key];

    if (!value) {
      recordTest(`Stripe: ${stripe.name}`, 'skip', 'Not configured');
      continue;
    }

    hasAny = true;
    if (value.startsWith(stripe.prefix)) {
      recordTest(`Stripe: ${stripe.name}`, 'pass', '', Date.now() - start);
    } else {
      recordTest(`Stripe: ${stripe.name}`, 'fail', 'Invalid format', Date.now() - start);
    }
  }

  if (!hasAny) {
    log('  ℹ Stripe not configured (payment features disabled)', 'cyan');
  }
}

// Test: GitHub integration
async function testGitHubIntegration() {
  logSection('TEST: GITHUB INTEGRATION');

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    recordTest('GitHub token', 'skip', 'Not configured');
    return;
  }

  const start = Date.now();
  if (token.startsWith('ghp_') || token.startsWith('ghs_')) {
    recordTest('GitHub token format', 'pass', '', Date.now() - start);

    // Test GitHub API connectivity
    const start2 = Date.now();
    try {
      const fetch = require('node-fetch');
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'istani-test',
        },
      });

      if (response.ok) {
        const data = await response.json();
        recordTest('GitHub API connectivity', 'pass', '', Date.now() - start2);
        log(`    User: ${data.login}`, 'cyan');
      } else {
        recordTest('GitHub API connectivity', 'fail', `HTTP ${response.status}`, Date.now() - start2);
      }
    } catch (error) {
      recordTest('GitHub API connectivity', 'fail', error.message, Date.now() - start2);
    }
  } else {
    recordTest('GitHub token format', 'fail', 'Invalid prefix', Date.now() - start);
  }
}

// Test: ElevenLabs configuration
async function testElevenLabsConfig() {
  logSection('TEST: ELEVENLABS CONFIGURATION');

  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId && !apiKey) {
    recordTest('ElevenLabs', 'skip', 'Not configured (voice features disabled)');
    return;
  }

  const start1 = Date.now();
  if (agentId) {
    recordTest('ElevenLabs Agent ID', 'pass', '', Date.now() - start1);
  } else {
    recordTest('ElevenLabs Agent ID', 'warn', 'Not configured');
  }

  const start2 = Date.now();
  if (apiKey) {
    recordTest('ElevenLabs API Key', 'pass', '', Date.now() - start2);
  } else {
    recordTest('ElevenLabs API Key', 'warn', 'Not configured');
  }
}

// Test: Security configuration
async function testSecurityConfig() {
  logSection('TEST: SECURITY CONFIGURATION');

  const securityVars = [
    { name: 'Cron Secret', key: 'CRON_SECRET', minLength: 16 },
    { name: 'Admin Refresh Token', key: 'ADMIN_REFRESH_TOKEN', minLength: 16 },
  ];

  for (const sec of securityVars) {
    const start = Date.now();
    const value = process.env[sec.key];

    if (!value) {
      recordTest(sec.name, 'warn', 'Not configured - endpoints unprotected');
      continue;
    }

    if (value.length >= sec.minLength) {
      recordTest(sec.name, 'pass', '', Date.now() - start);
    } else {
      recordTest(sec.name, 'fail', 'Too short (insecure)', Date.now() - start);
    }
  }
}

// Test: External APIs
async function testExternalAPIs() {
  logSection('TEST: EXTERNAL APIs');

  const apis = [
    { name: 'Pexels', key: 'PEXELS_API_KEY' },
    { name: 'Unsplash', key: 'UNSPLASH_ACCESS_KEY' },
    { name: 'USDA', key: 'USDA_API_KEY' },
  ];

  for (const api of apis) {
    const start = Date.now();
    const value = process.env[api.key];

    if (!value) {
      recordTest(`${api.name} API`, 'skip', 'Not configured');
    } else if (value.length > 20) {
      recordTest(`${api.name} API`, 'pass', '', Date.now() - start);
    } else {
      recordTest(`${api.name} API`, 'warn', 'Suspiciously short key');
    }
  }
}

// Test: Config health check
async function testConfigHealthCheck() {
  logSection('TEST: CONFIG HEALTH CHECK');

  const start = Date.now();
  try {
    const health = config.healthCheck();
    recordTest('Config health check', 'pass', '', Date.now() - start);

    log(`    Status: ${health.status}`, health.status === 'healthy' ? 'green' : 'yellow');
    log(`    Environment: ${health.environment}`, 'cyan');
    log(`    Total services: ${health.services.total}`, 'cyan');
    log(`    AI providers: ${health.services.ai}`, 'cyan');
    log(`    Deployment services: ${health.services.deployment}`, 'cyan');
    log(`    GitHub enabled: ${health.services.github ? 'yes' : 'no'}`, 'cyan');

    if (health.details.aiProviders.length > 0) {
      log(`    AI models: ${health.details.aiProviders.join(', ')}`, 'cyan');
    }
  } catch (error) {
    recordTest('Config health check', 'fail', error.message, Date.now() - start);
  }
}

// Test: Environment validation module
async function testEnvValidationModule() {
  logSection('TEST: ENVIRONMENT VALIDATION MODULE');

  // Skip this test since checkEnvironment is not available (TypeScript module)
  recordTest('Environment validation module', 'skip', 'TypeScript module not available in test context');
}

// Stress test: Load configuration multiple times
async function stressTestConfig(iterations = 100) {
  logSection(`STRESS TEST: CONFIG LOADING (${iterations} iterations)`);

  const start = Date.now();
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const health = config.healthCheck();
      const providers = config.getAIProviders();
      const services = config.getEnabledServices();

      if (!health || !providers || !services) {
        errors++;
      }
    } catch (error) {
      errors++;
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);
    }
  }

  process.stdout.write('\r');
  const duration = Date.now() - start;
  const avgTime = duration / iterations;

  if (errors === 0) {
    recordTest('Config stress test', 'pass', `${iterations} iterations, avg ${avgTime.toFixed(2)}ms`, duration);
    log(`    Total time: ${duration}ms`, 'cyan');
    log(`    Average per iteration: ${avgTime.toFixed(2)}ms`, 'cyan');
    log(`    Throughput: ${(1000 / avgTime).toFixed(2)} ops/sec`, 'cyan');
  } else {
    recordTest('Config stress test', 'fail', `${errors} errors in ${iterations} iterations`, duration);
  }
}

// Print test summary
function printSummary() {
  logSection('TEST SUMMARY');

  const duration = Date.now() - stats.startTime;
  const durationSec = (duration / 1000).toFixed(2);

  console.log(`Total tests:   ${stats.total}`);
  log(`Passed:        ${stats.passed}`, 'green');
  log(`Failed:        ${stats.failed}`, stats.failed > 0 ? 'red' : 'reset');
  log(`Skipped:       ${stats.skipped}`, 'yellow');
  log(`Warnings:      ${stats.warnings}`, 'yellow');
  console.log(`Duration:      ${durationSec}s`);

  const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
  console.log(`Pass rate:     ${passRate}%`);

  console.log('\n' + '='.repeat(80));

  if (stats.failed > 0) {
    log('❌ TESTS FAILED', 'red');
    log('\nFailed tests:', 'red');
    stats.tests
      .filter((t) => t.status === 'fail')
      .forEach((t) => {
        log(`  - ${t.name}: ${t.message}`, 'red');
      });
  } else {
    log('✅ ALL TESTS PASSED', 'green');
    if (stats.skipped > 0) {
      log(`\n${stats.skipped} tests skipped due to missing optional configuration`, 'yellow');
    }
  }

  console.log('='.repeat(80));
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const iterations = parseInt(args.find((a) => a.startsWith('--iterations='))?.split('=')[1] || '100');
  const mode = args.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'all';

  console.clear();
  logSection('ISTANI COMPREHENSIVE ENVIRONMENT TEST SUITE');
  log(`Date: ${new Date().toISOString()}`, 'cyan');
  log(`Node: ${process.version}`, 'cyan');
  log(`Mode: ${mode}`, 'cyan');
  log(`Stress test iterations: ${iterations}`, 'cyan');

  // Run all tests
  await testEnvironmentDetection();
  await testRequiredVariables();
  await testSupabaseConnection();
  await testAIServices();
  await testStripeConfig();
  await testGitHubIntegration();
  await testElevenLabsConfig();
  await testSecurityConfig();
  await testExternalAPIs();
  await testConfigHealthCheck();
  await testEnvValidationModule();

  if (mode === 'all') {
    await stressTestConfig(iterations);
  }

  // Print summary
  printSummary();

  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run tests
main().catch((error) => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
