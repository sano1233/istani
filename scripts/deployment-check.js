#!/usr/bin/env node
/**
 * Comprehensive Deployment Readiness Check
 * Scans codebase for common deployment issues
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const issues = {
  critical: [],
  warnings: [],
  info: [],
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function addIssue(severity, message, file = null) {
  const issue = file ? `${file}: ${message}` : message;
  issues[severity].push(issue);
}

async function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', COLORS.cyan);

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optionalVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'PEXELS_API_KEY',
    'USDA_API_KEY',
  ];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      addIssue('critical', `Missing required environment variable: ${varName}`);
    } else {
      log(`  ✓ ${varName} is set`, COLORS.green);
    }
  });

  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      addIssue('info', `Optional environment variable not set: ${varName}`);
    } else {
      log(`  ✓ ${varName} is set`, COLORS.green);
    }
  });
}

async function checkTypeScript() {
  log('\n🔍 Running TypeScript Check...', COLORS.cyan);

  try {
    const { stdout, stderr } = await execPromise('npm run typecheck');
    log('  ✓ TypeScript check passed', COLORS.green);
  } catch (error) {
    addIssue('critical', 'TypeScript errors found');
    log(`  ✗ TypeScript check failed: ${error.message}`, COLORS.red);
  }
}

async function checkBuild() {
  log('\n🏗️  Running Production Build...', COLORS.cyan);

  try {
    const { stdout, stderr } = await execPromise('npm run build');
    log('  ✓ Build successful', COLORS.green);

    // Check for build warnings
    if (stdout.includes('⚠')) {
      const warnings = stdout.match(/⚠[^\n]+/g) || [];
      warnings.forEach(warning => {
        addIssue('warnings', `Build warning: ${warning}`);
      });
    }
  } catch (error) {
    addIssue('critical', 'Build failed');
    log(`  ✗ Build failed: ${error.message}`, COLORS.red);
  }
}

async function checkForRemovedDependencies() {
  log('\n📦 Checking for Removed Dependencies...', COLORS.cyan);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const removedPackages = ['stripe', '@stripe/stripe-js'];

  removedPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg] || packageJson.devDependencies?.[pkg]) {
      addIssue('warnings', `Package ${pkg} should be removed from package.json`);
      log(`  ⚠ ${pkg} still in dependencies`, COLORS.yellow);
    } else {
      log(`  ✓ ${pkg} properly removed`, COLORS.green);
    }
  });
}

async function checkForBrokenImports() {
  log('\n🔗 Checking for Broken Imports...', COLORS.cyan);

  const brokenImports = [
    'lib/stripe',
    'lib/store/cart-store',
    'components/product-card',
  ];

  try {
    const { stdout } = await execPromise(
      `grep -r "${brokenImports.join('\\|')}" app/ lib/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`
    );

    if (stdout.trim()) {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        addIssue('critical', `Broken import detected: ${line}`);
        log(`  ✗ ${line}`, COLORS.red);
      });
    } else {
      log('  ✓ No broken imports found', COLORS.green);
    }
  } catch (error) {
    log('  ℹ Unable to check for broken imports', COLORS.yellow);
  }
}

async function checkMiddleware() {
  log('\n⚙️  Checking Middleware Configuration...', COLORS.cyan);

  if (fs.existsSync('middleware.ts')) {
    const content = fs.readFileSync('middleware.ts', 'utf8');

    // Check for error handling
    if (!content.includes('try') || !content.includes('catch')) {
      addIssue('warnings', 'Middleware should have error handling');
      log('  ⚠ Missing error handling in middleware', COLORS.yellow);
    } else {
      log('  ✓ Middleware has error handling', COLORS.green);
    }

    // Check for proper matchers
    if (content.includes('matcher')) {
      log('  ✓ Middleware has proper matcher configuration', COLORS.green);
    } else {
      addIssue('warnings', 'Middleware should have matcher configuration');
      log('  ⚠ Missing matcher in middleware', COLORS.yellow);
    }
  } else {
    addIssue('info', 'No middleware.ts file found');
  }
}

async function checkEdgeRuntimeCompatibility() {
  log('\n⚡ Checking Edge Runtime Compatibility...', COLORS.cyan);

  try {
    const { stdout } = await execPromise(
      `grep -r "export const runtime = 'edge'" app/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`
    );

    if (stdout.trim()) {
      const files = stdout.trim().split('\n').map(line => line.split(':')[0]);
      log(`  ℹ Found ${files.length} edge runtime route(s)`, COLORS.blue);
      files.forEach(file => {
        log(`    - ${file}`, COLORS.blue);

        // Check if edge routes use incompatible features
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('createServerClient') || content.includes('cookies()')) {
          addIssue('warnings', `${file}: Edge runtime may have issues with Supabase server client`);
        }
      });
    } else {
      log('  ✓ No edge runtime routes found', COLORS.green);
    }
  } catch (error) {
    log('  ℹ Unable to check edge runtime', COLORS.yellow);
  }
}

async function generateReport() {
  log('\n' + '='.repeat(60), COLORS.bright);
  log('📊 DEPLOYMENT READINESS REPORT', COLORS.bright);
  log('='.repeat(60), COLORS.bright);

  if (issues.critical.length > 0) {
    log(`\n❌ CRITICAL ISSUES (${issues.critical.length}):`, COLORS.red);
    issues.critical.forEach(issue => log(`  - ${issue}`, COLORS.red));
  }

  if (issues.warnings.length > 0) {
    log(`\n⚠️  WARNINGS (${issues.warnings.length}):`, COLORS.yellow);
    issues.warnings.forEach(issue => log(`  - ${issue}`, COLORS.yellow));
  }

  if (issues.info.length > 0) {
    log(`\nℹ️  INFORMATION (${issues.info.length}):`, COLORS.blue);
    issues.info.forEach(issue => log(`  - ${issue}`, COLORS.blue));
  }

  if (issues.critical.length === 0 && issues.warnings.length === 0) {
    log('\n✅ ALL CHECKS PASSED! Ready for deployment.', COLORS.green);
    log('='.repeat(60), COLORS.bright);
    return 0;
  } else if (issues.critical.length > 0) {
    log('\n❌ CRITICAL ISSUES FOUND! Fix before deploying.', COLORS.red);
    log('='.repeat(60), COLORS.bright);
    return 1;
  } else {
    log('\n⚠️  WARNINGS FOUND. Review before deploying.', COLORS.yellow);
    log('='.repeat(60), COLORS.bright);
    return 0;
  }
}

async function main() {
  log('🚀 Starting Deployment Readiness Check...', COLORS.cyan);

  await checkEnvironmentVariables();
  await checkForRemovedDependencies();
  await checkForBrokenImports();
  await checkMiddleware();
  await checkEdgeRuntimeCompatibility();
  await checkTypeScript();
  await checkBuild();

  const exitCode = await generateReport();
  process.exit(exitCode);
}

main().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, COLORS.red);
  process.exit(1);
});
