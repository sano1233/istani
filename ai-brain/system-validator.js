#!/usr/bin/env node
/**
 * System Validator - Comprehensive Testing and Validation
 *
 * Validates the entire automated code fixer/resolver/merger system:
 * - Component health checks
 * - AI service connectivity
 * - GitHub integration
 * - Git configuration
 * - Dependencies validation
 *
 * Usage: node ai-brain/system-validator.js [options]
 * Options:
 *   --full              Run full validation suite
 *   --quick             Run quick checks only
 *   --component <name>  Test specific component
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validation results
const validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

/**
 * Record test result
 */
function recordTest(name, passed, message = '', level = 'error') {
  validationResults.tests.push({ name, passed, message, level });

  if (passed) {
    validationResults.passed++;
    log(`   ✅ ${name}`, 'green');
  } else {
    if (level === 'warning') {
      validationResults.warnings++;
      log(`   ⚠️  ${name}: ${message}`, 'yellow');
    } else {
      validationResults.failed++;
      log(`   ❌ ${name}: ${message}`, 'red');
    }
  }
}

/**
 * Test 1: Check Node.js version
 */
async function validateNodeVersion() {
  log('\n🔍 Checking Node.js version...', 'cyan');

  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);

    if (majorVersion >= 18) {
      recordTest('Node.js version', true);
      log(`      Version: ${version}`, 'gray');
    } else {
      recordTest('Node.js version', false, `Node.js ${version} is too old. Requires v18+`);
    }
  } catch (error) {
    recordTest('Node.js version', false, error.message);
  }
}

/**
 * Test 2: Check Git installation and configuration
 */
async function validateGit() {
  log('\n🔍 Checking Git installation and configuration...', 'cyan');

  try {
    const { stdout } = await execAsync('git --version');
    recordTest('Git installed', true);
    log(`      Version: ${stdout.trim()}`, 'gray');

    // Check git config
    try {
      const { stdout: userName } = await execAsync('git config user.name');
      const { stdout: userEmail } = await execAsync('git config user.email');

      if (userName.trim() && userEmail.trim()) {
        recordTest('Git configuration', true);
        log(`      User: ${userName.trim()} <${userEmail.trim()}>`, 'gray');
      } else {
        recordTest('Git configuration', false, 'Git user.name or user.email not set', 'warning');
      }
    } catch (configError) {
      recordTest('Git configuration', false, 'Git not configured', 'warning');
    }
  } catch (error) {
    recordTest('Git installed', false, 'Git not found');
  }
}

/**
 * Test 3: Check GitHub CLI
 */
async function validateGitHubCLI() {
  log('\n🔍 Checking GitHub CLI...', 'cyan');

  try {
    const { stdout } = await execAsync('gh --version');
    recordTest('GitHub CLI installed', true);
    log(`      Version: ${stdout.trim().split('\n')[0]}`, 'gray');

    // Check authentication
    try {
      await execAsync('gh auth status');
      recordTest('GitHub CLI authenticated', true);
    } catch (authError) {
      recordTest('GitHub CLI authenticated', false, 'Not authenticated with GitHub', 'warning');
    }
  } catch (error) {
    recordTest('GitHub CLI installed', false, 'GitHub CLI (gh) not found');
  }
}

/**
 * Test 4: Check npm and dependencies
 */
async function validateDependencies() {
  log('\n🔍 Checking dependencies...', 'cyan');

  try {
    const { stdout } = await execAsync('npm --version');
    recordTest('npm installed', true);
    log(`      Version: ${stdout.trim()}`, 'gray');

    // Check if node_modules exists
    try {
      await fs.access('node_modules');
      recordTest('Dependencies installed', true);
    } catch (error) {
      recordTest(
        'Dependencies installed',
        false,
        'node_modules not found - run npm install',
        'warning',
      );
    }

    // Check ai-brain dependencies
    try {
      await fs.access('ai-brain/node_modules');
      recordTest('AI Brain dependencies installed', true);
    } catch (error) {
      recordTest(
        'AI Brain dependencies installed',
        false,
        'ai-brain/node_modules not found',
        'warning',
      );
    }
  } catch (error) {
    recordTest('npm installed', false, error.message);
  }
}

/**
 * Test 5: Check AI service availability
 */
async function validateAIServices() {
  log('\n🔍 Checking AI services...', 'cyan');

  const services = ['gemini', 'claude', 'qwen'];

  for (const service of services) {
    try {
      const helperPath = path.join(__dirname, `${service}-helper.js`);

      // Check if helper file exists
      try {
        await fs.access(helperPath);
        recordTest(`${service}-helper.js exists`, true);

        // Test service with simple prompt
        try {
          const { stdout, stderr } = await execAsync(`node "${helperPath}"`, {
            input: 'Hello',
            timeout: 10000,
          });

          if (stderr && stderr.includes('Set')) {
            recordTest(`${service} API key`, false, 'API key not configured', 'warning');
          } else if (stdout.trim()) {
            recordTest(`${service} service`, true);
          } else {
            recordTest(`${service} service`, false, 'No response from service', 'warning');
          }
        } catch (testError) {
          const errorMsg = testError.message || '';
          if (errorMsg.includes('Set') || errorMsg.includes('API key')) {
            recordTest(`${service} service`, false, 'API key not configured', 'warning');
          } else {
            recordTest(`${service} service`, false, 'Service unavailable', 'warning');
          }
        }
      } catch (error) {
        recordTest(`${service}-helper.js exists`, false, 'Helper file not found');
      }
    } catch (error) {
      recordTest(`${service} service`, false, error.message);
    }
  }
}

/**
 * Test 6: Check core system files
 */
async function validateSystemFiles() {
  log('\n🔍 Checking system files...', 'cyan');

  const requiredFiles = [
    'ai-brain/automated-code-fixer.js',
    'ai-brain/intelligent-conflict-resolver.js',
    'ai-brain/automated-merger.js',
    'ai-brain/pr-handler.js',
    'ai-brain/pr-analyzer.js',
    'ai-brain/auto-fix-system.js',
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      recordTest(`${path.basename(file)} exists`, true);
    } catch (error) {
      recordTest(`${path.basename(file)} exists`, false, 'File not found');
    }
  }
}

/**
 * Test 7: Test automated-code-fixer
 */
async function testCodeFixer() {
  log('\n🔍 Testing automated code fixer...', 'cyan');

  try {
    const fixer = require('./automated-code-fixer');
    recordTest('Code fixer module loads', true);

    // Test that functions exist
    if (typeof fixer.runESLintFix === 'function') {
      recordTest('Code fixer has runESLintFix', true);
    } else {
      recordTest('Code fixer has runESLintFix', false, 'Function not found');
    }

    if (typeof fixer.runPrettierFix === 'function') {
      recordTest('Code fixer has runPrettierFix', true);
    } else {
      recordTest('Code fixer has runPrettierFix', false, 'Function not found');
    }
  } catch (error) {
    recordTest('Code fixer module loads', false, error.message);
  }
}

/**
 * Test 8: Test conflict resolver
 */
async function testConflictResolver() {
  log('\n🔍 Testing conflict resolver...', 'cyan');

  try {
    const resolver = require('./intelligent-conflict-resolver');
    recordTest('Conflict resolver module loads', true);

    // Test that functions exist
    if (typeof resolver.resolveFileConflict === 'function') {
      recordTest('Conflict resolver has resolveFileConflict', true);
    } else {
      recordTest('Conflict resolver has resolveFileConflict', false, 'Function not found');
    }

    if (typeof resolver.analyzeConflict === 'function') {
      recordTest('Conflict resolver has analyzeConflict', true);
    } else {
      recordTest('Conflict resolver has analyzeConflict', false, 'Function not found');
    }
  } catch (error) {
    recordTest('Conflict resolver module loads', false, error.message);
  }
}

/**
 * Test 9: Test automated merger
 */
async function testMerger() {
  log('\n🔍 Testing automated merger...', 'cyan');

  try {
    const merger = require('./automated-merger');
    recordTest('Automated merger module loads', true);

    // Test that functions exist
    if (typeof merger.processPR === 'function') {
      recordTest('Merger has processPR', true);
    } else {
      recordTest('Merger has processPR', false, 'Function not found');
    }

    if (typeof merger.performAICodeReview === 'function') {
      recordTest('Merger has performAICodeReview', true);
    } else {
      recordTest('Merger has performAICodeReview', false, 'Function not found');
    }
  } catch (error) {
    recordTest('Automated merger module loads', false, error.message);
  }
}

/**
 * Test 10: Check GitHub Actions workflow
 */
async function validateGitHubActions() {
  log('\n🔍 Checking GitHub Actions workflow...', 'cyan');

  try {
    await fs.access('.github/workflows/automated-code-resolver-merger.yml');
    recordTest('GitHub Actions workflow exists', true);

    // Read and validate workflow
    const content = await fs.readFile(
      '.github/workflows/automated-code-resolver-merger.yml',
      'utf8',
    );

    if (content.includes('automated-code-fixer.js')) {
      recordTest('Workflow includes code fixer', true);
    } else {
      recordTest('Workflow includes code fixer', false, 'Not configured', 'warning');
    }

    if (content.includes('intelligent-conflict-resolver.js')) {
      recordTest('Workflow includes conflict resolver', true);
    } else {
      recordTest('Workflow includes conflict resolver', false, 'Not configured', 'warning');
    }

    if (content.includes('automated-merger.js')) {
      recordTest('Workflow includes merger', true);
    } else {
      recordTest('Workflow includes merger', false, 'Not configured', 'warning');
    }
  } catch (error) {
    recordTest('GitHub Actions workflow exists', false, 'Workflow file not found');
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  log('\n' + '═'.repeat(70), 'cyan');
  log('  VALIDATION REPORT', 'bright');
  log('═'.repeat(70), 'cyan');

  const total = validationResults.passed + validationResults.failed + validationResults.warnings;

  log(`\n📊 Summary:`, 'cyan');
  log(`   Total tests: ${total}`, 'gray');
  log(`   Passed: ${validationResults.passed}`, 'green');
  log(`   Failed: ${validationResults.failed}`, validationResults.failed > 0 ? 'red' : 'gray');
  log(
    `   Warnings: ${validationResults.warnings}`,
    validationResults.warnings > 0 ? 'yellow' : 'gray',
  );

  if (total > 0) {
    const passRate = Math.round((validationResults.passed / total) * 100);
    log(
      `\n   Pass rate: ${passRate}%`,
      passRate === 100 ? 'green' : passRate >= 80 ? 'yellow' : 'red',
    );
  }

  // List failures
  const failures = validationResults.tests.filter((t) => !t.passed && t.level === 'error');
  if (failures.length > 0) {
    log(`\n❌ Failed Tests:`, 'red');
    failures.forEach((t) => {
      log(`   - ${t.name}: ${t.message}`, 'red');
    });
  }

  // List warnings
  const warnings = validationResults.tests.filter((t) => !t.passed && t.level === 'warning');
  if (warnings.length > 0) {
    log(`\n⚠️  Warnings:`, 'yellow');
    warnings.forEach((t) => {
      log(`   - ${t.name}: ${t.message}`, 'yellow');
    });
  }

  log('\n' + '═'.repeat(70), 'cyan');

  if (validationResults.failed === 0) {
    log('\n✅ System validation complete! All critical tests passed.', 'green');
    if (validationResults.warnings > 0) {
      log('⚠️  Some warnings were found but system is operational.', 'yellow');
    }
  } else {
    log('\n❌ System validation failed. Please address the issues above.', 'red');
  }

  return validationResults.failed === 0;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const isQuick = args.includes('--quick');
  const isFull = args.includes('--full') || !isQuick;

  log('═'.repeat(70), 'cyan');
  log('  SYSTEM VALIDATOR', 'bright');
  log('  Automated Code Fixer/Resolver/Merger', 'gray');
  log('═'.repeat(70), 'cyan');

  log(`\n⚙️  Mode: ${isQuick ? 'Quick' : 'Full'} Validation`, 'cyan');

  // Run quick tests
  await validateNodeVersion();
  await validateGit();
  await validateGitHubCLI();
  await validateDependencies();
  await validateSystemFiles();

  // Run full tests if requested
  if (isFull) {
    await validateAIServices();
    await testCodeFixer();
    await testConflictResolver();
    await testMerger();
    await validateGitHubActions();
  }

  // Generate report
  const success = generateReport();

  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'gray');
    }
    process.exit(1);
  });
}

module.exports = {
  validateNodeVersion,
  validateGit,
  validateGitHubCLI,
  validateDependencies,
  validateAIServices,
  validateSystemFiles,
  testCodeFixer,
  testConflictResolver,
  testMerger,
  validationResults,
};
