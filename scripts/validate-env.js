#!/usr/bin/env node

/**
 * Environment Validation Script
 *
 * Validates environment variables across all environments:
 * - Development (.env.local)
 * - Production (.env or Vercel)
 * - AI Agent
 * - ElevenLabs Agent
 *
 * Usage:
 *   node scripts/validate-env.js [--env=development|production|all]
 *   npm run validate-env
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const fs = require('fs');
const path = require('path');

// Color output for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80));
}

// Variable definitions with validation rules
const VARIABLE_DEFINITIONS = {
  // CRITICAL - Required for app to function
  CRITICAL: {
    NEXT_PUBLIC_SUPABASE_URL: {
      validate: (v) => v && v.includes('supabase.co'),
      description: 'Supabase project URL',
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      validate: (v) => v && v.startsWith('eyJ') && v.length > 100,
      description: 'Supabase anonymous key',
    },
    NEXT_PUBLIC_SITE_URL: {
      validate: (v) => v && (v.startsWith('http://') || v.startsWith('https://')),
      description: 'Application site URL',
    },
  },

  // IMPORTANT - Required for production features
  IMPORTANT: {
    SUPABASE_SERVICE_ROLE_KEY: {
      validate: (v) => v && v.startsWith('eyJ') && v.length > 100,
      description: 'Supabase service role key (server-side)',
    },
    CRON_SECRET: {
      validate: (v) => v && v.length >= 16,
      description: 'Secret for protecting cron endpoints',
    },
  },

  // PAYMENTS - Required for e-commerce
  PAYMENTS: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      validate: (v) => v && (v.startsWith('pk_test_') || v.startsWith('pk_live_')),
      description: 'Stripe publishable key',
    },
    STRIPE_SECRET_KEY: {
      validate: (v) => v && (v.startsWith('sk_test_') || v.startsWith('sk_live_')),
      description: 'Stripe secret key',
    },
    STRIPE_WEBHOOK_SECRET: {
      validate: (v) => v && v.startsWith('whsec_'),
      description: 'Stripe webhook secret',
    },
  },

  // AI SERVICES - Optional but recommended
  AI_SERVICES: {
    OPENAI_API_KEY: {
      validate: (v) => v && (v.startsWith('sk-') || v.startsWith('sk-proj-')),
      description: 'OpenAI API key',
    },
    GEMINI_API_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'Google Gemini API key',
    },
    ANTHROPIC_API_KEY: {
      validate: (v) => v && v.startsWith('sk-ant-'),
      description: 'Anthropic Claude API key',
    },
    QWEN_API_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'Alibaba Qwen API key',
    },
  },

  // VOICE AI - Optional
  VOICE_AI: {
    NEXT_PUBLIC_ELEVENLABS_AGENT_ID: {
      validate: (v) => v && v.length > 10,
      description: 'ElevenLabs agent ID',
    },
    ELEVENLABS_API_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'ElevenLabs API key',
    },
  },

  // EXTERNAL APIs - Optional
  EXTERNAL_APIS: {
    PEXELS_API_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'Pexels image API key',
    },
    UNSPLASH_ACCESS_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'Unsplash image API key',
    },
    USDA_API_KEY: {
      validate: (v) => v && v.length > 20,
      description: 'USDA food database API key',
    },
  },

  // AUTOMATION - Required for CI/CD
  AUTOMATION: {
    GITHUB_TOKEN: {
      validate: (v) => v && (v.startsWith('ghp_') || v.startsWith('ghs_')),
      description: 'GitHub personal access token',
    },
    VERCEL_TOKEN: {
      validate: (v) => v && v.length > 20,
      description: 'Vercel deployment token',
    },
  },

  // MONITORING - Optional
  MONITORING: {
    NEXT_PUBLIC_SENTRY_DSN: {
      validate: (v) => v && v.includes('sentry.io'),
      description: 'Sentry error tracking DSN',
    },
    BETTERSTACK_TOKEN: {
      validate: (v) => v && v.length > 20,
      description: 'BetterStack logging token',
    },
  },
};

// Validation results
const results = {
  critical: { configured: [], missing: [], invalid: [] },
  important: { configured: [], missing: [], invalid: [] },
  payments: { configured: [], missing: [], invalid: [] },
  ai_services: { configured: [], missing: [], invalid: [] },
  voice_ai: { configured: [], missing: [], invalid: [] },
  external_apis: { configured: [], missing: [], invalid: [] },
  automation: { configured: [], missing: [], invalid: [] },
  monitoring: { configured: [], missing: [], invalid: [] },
};

function validateCategory(categoryName, variables) {
  const resultKey = categoryName.toLowerCase();

  for (const [varName, config] of Object.entries(variables)) {
    const value = process.env[varName];

    if (!value) {
      results[resultKey].missing.push({ name: varName, ...config });
    } else if (!config.validate(value)) {
      results[resultKey].invalid.push({ name: varName, ...config, value: maskValue(value) });
    } else {
      results[resultKey].configured.push({ name: varName, ...config });
    }
  }
}

function maskValue(value) {
  if (!value || value.length < 8) return '***';
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

function printResults() {
  logSection('ENVIRONMENT VALIDATION RESULTS');

  let totalConfigured = 0;
  let totalMissing = 0;
  let totalInvalid = 0;
  let hasErrors = false;

  // Print each category
  for (const [category, data] of Object.entries(results)) {
    const categoryName = category.toUpperCase().replace('_', ' ');
    const total = data.configured.length + data.missing.length + data.invalid.length;

    if (total === 0) continue;

    console.log(`\n${colors.cyan}${categoryName}${colors.reset} (${data.configured.length}/${total} configured)`);

    // Configured variables
    if (data.configured.length > 0) {
      data.configured.forEach((v) => {
        log(`  ✓ ${v.name}`, 'green');
      });
    }

    // Missing variables
    if (data.missing.length > 0) {
      data.missing.forEach((v) => {
        const symbol = category === 'critical' || category === 'important' ? '✗' : '○';
        const color = category === 'critical' || category === 'important' ? 'red' : 'yellow';
        log(`  ${symbol} ${v.name} - ${v.description}`, color);
      });

      if (category === 'critical' || category === 'important') {
        hasErrors = true;
      }
    }

    // Invalid variables
    if (data.invalid.length > 0) {
      data.invalid.forEach((v) => {
        log(`  ✗ ${v.name} - Invalid format: ${v.value}`, 'red');
      });
      hasErrors = true;
    }

    totalConfigured += data.configured.length;
    totalMissing += data.missing.length;
    totalInvalid += data.invalid.length;
  }

  // Summary
  logSection('SUMMARY');
  console.log(`Configured:  ${colors.green}${totalConfigured}${colors.reset}`);
  console.log(`Missing:     ${colors.yellow}${totalMissing}${colors.reset}`);
  console.log(`Invalid:     ${colors.red}${totalInvalid}${colors.reset}`);

  // Environment info
  console.log(`\nEnvironment: ${colors.cyan}${process.env.NODE_ENV || 'development'}${colors.reset}`);
  console.log(`Site URL:    ${colors.cyan}${process.env.NEXT_PUBLIC_SITE_URL || 'not set'}${colors.reset}`);

  // Overall status
  console.log('\n' + '='.repeat(80));
  if (hasErrors) {
    log('❌ VALIDATION FAILED - Critical or important variables missing/invalid', 'red');
    log('\nAction required:', 'yellow');
    log('1. Check .env.example for required variables', 'yellow');
    log('2. Copy missing variables to .env.local', 'yellow');
    log('3. For production, set in Vercel dashboard', 'yellow');
    console.log('='.repeat(80));
    process.exit(1);
  } else {
    log('✅ VALIDATION PASSED - All critical variables configured correctly', 'green');
    if (totalMissing > 0) {
      log(`\nNote: ${totalMissing} optional variables not configured`, 'yellow');
    }
    console.log('='.repeat(80));
  }
}

// Check if .env files exist
function checkEnvFiles() {
  logSection('CHECKING ENVIRONMENT FILES');

  const files = [
    { path: '.env.local', required: false, description: 'Local development overrides' },
    { path: '.env', required: false, description: 'Local development' },
    { path: '.env.example', required: true, description: 'Development template' },
    { path: '.env.unified.example', required: true, description: 'Master template' },
    { path: '.env.production.template', required: true, description: 'Production template' },
  ];

  files.forEach((file) => {
    const exists = fs.existsSync(path.join(process.cwd(), file.path));
    const symbol = exists ? '✓' : (file.required ? '✗' : '○');
    const color = exists ? 'green' : (file.required ? 'red' : 'yellow');
    log(`  ${symbol} ${file.path.padEnd(30)} - ${file.description}`, color);
  });
}

// Test database connection
async function testDatabaseConnection() {
  logSection('TESTING DATABASE CONNECTION');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('  ⚠ Skipping - Supabase credentials not configured', 'yellow');
    return;
  }

  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      log('  ✓ Supabase connection successful', 'green');
    } else {
      log(`  ✗ Supabase connection failed: ${response.status} ${response.statusText}`, 'red');
    }
  } catch (error) {
    log(`  ✗ Supabase connection error: ${error.message}`, 'red');
  }
}

// Main execution
async function main() {
  console.clear();
  logSection('ISTANI ENVIRONMENT VALIDATION');
  log(`Date: ${new Date().toISOString()}`, 'cyan');
  log(`Node: ${process.version}`, 'cyan');
  log(`CWD:  ${process.cwd()}`, 'cyan');

  // Check environment files
  checkEnvFiles();

  // Validate all categories
  for (const [categoryName, variables] of Object.entries(VARIABLE_DEFINITIONS)) {
    validateCategory(categoryName, variables);
  }

  // Test database connection
  await testDatabaseConnection();

  // Print results
  printResults();
}

// Run validation
main().catch((error) => {
  log(`\n❌ Validation script error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
