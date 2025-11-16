#!/usr/bin/env node

/**
 * AI Brain Secrets Health Check
 * Validates that required and optional secrets are properly configured
 */

// Simple color helpers (no dependencies needed)
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  // Fallback if chalk is not installed
  chalk = {
    green: s => s,
    yellow: s => s,
    red: s => s,
    blue: s => s
  };
}

// Define secret categories and their importance
const secretsConfig = {
  required: {
    GitHub: ['GITHUB_TOKEN'],
    Supabase: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
  },
  optional: {
    'AI Services': [
      'GEMINI_API_KEY',
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'QWEN_API_KEY',
      'DEEPSEEK_API_KEY',
      'COHERE_API_KEY',
      'HUGGINGFACE_API_KEY'
    ],
    Deployment: ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID', 'SUPABASE_SERVICE_ROLE_KEY']
  }
};

let hasErrors = false;
let hasWarnings = false;

console.log('\n🔐 AI Brain Secrets Health Check\n');
console.log('━'.repeat(60));

// Check required secrets
console.log('\n📋 Required Secrets:');
Object.entries(secretsConfig.required).forEach(([category, secrets]) => {
  console.log(`\n  ${category}:`);
  secrets.forEach(secret => {
    const value = process.env[secret];
    if (!value || value === '' || value === 'undefined') {
      console.log(`    ❌ ${secret} - MISSING (REQUIRED)`);
      hasErrors = true;
    } else {
      const preview = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`    ✅ ${secret} - Configured (${preview})`);
    }
  });
});

// Check optional secrets
console.log('\n\n📝 Optional Secrets:');
Object.entries(secretsConfig.optional).forEach(([category, secrets]) => {
  console.log(`\n  ${category}:`);
  const configured = [];
  const missing = [];

  secrets.forEach(secret => {
    const value = process.env[secret];
    if (!value || value === '' || value === 'undefined') {
      missing.push(secret);
    } else {
      configured.push(secret);
    }
  });

  configured.forEach(secret => {
    const value = process.env[secret];
    const preview = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`    ✅ ${secret} - Configured (${preview})`);
  });

  missing.forEach(secret => {
    console.log(`    ⚠️  ${secret} - Not configured (optional)`);
    hasWarnings = true;
  });
});

// Summary
console.log('\n' + '━'.repeat(60));
console.log('\n📊 Summary:\n');

if (hasErrors) {
  console.log('  ❌ Status: FAILED - Required secrets are missing');
  console.log('  💡 Action: Configure missing required secrets in GitHub');
  process.exit(1);
} else if (hasWarnings) {
  console.log('  ⚠️  Status: PARTIAL - Some optional secrets not configured');
  console.log('  💡 Note: AI Brain will use available services only');
  console.log('  ✅ Required secrets: All configured');
  process.exit(0);
} else {
  console.log('  ✅ Status: HEALTHY - All secrets configured');
  console.log('  🚀 AI Brain ready for full operation');
  process.exit(0);
}
