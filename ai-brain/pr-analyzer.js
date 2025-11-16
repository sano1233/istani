#!/usr/bin/env node
/**
 * PR Branch Analyzer
 *
 * Analyzes all feature branches, identifies potential issues,
 * and provides recommendations for merging or fixing.
 *
 * Usage: node ai-brain/pr-analyzer.js [options]
 *
 * Options:
 *   --analyze         Analyze all branches
 *   --branch <name>   Analyze specific branch
 *   --fix             Attempt to fix issues automatically
 *   --merge           Merge branches with consensus approval
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Try to load unified config
let config;
try {
  config = require('../config');
} catch (error) {
  console.error('Warning: Could not load unified config. Using environment variables.');
  config = null;
}

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

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    }).trim();
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

/**
 * Get all remote feature branches
 */
function getFeatureBranches() {
  const branches = exec('git branch -r', { silent: true })
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b && !b.includes('HEAD'))
    .map((b) => b.replace('origin/', ''));

  const codexBranches = branches.filter((b) => b.startsWith('codex/'));
  const copilotBranches = branches.filter((b) => b.startsWith('copilot/'));
  const claudeBranches = branches.filter((b) => b.startsWith('claude/'));

  return {
    all: branches,
    codex: codexBranches,
    copilot: copilotBranches,
    claude: claudeBranches,
    total: branches.length,
    bySource: {
      codex: codexBranches.length,
      copilot: copilotBranches.length,
      claude: claudeBranches.length,
    },
  };
}

/**
 * Analyze a specific branch
 */
function analyzeBranch(branchName) {
  console.log(colorize(`\nAnalyzing branch: ${branchName}`, 'cyan'));
  console.log(colorize('─'.repeat(70), 'gray'));

  try {
    // Get branch information
    const commitHash = exec(`git rev-parse origin/${branchName}`, { silent: true });
    const commitMsg = exec(`git log -1 --pretty=format:"%s" origin/${branchName}`, {
      silent: true,
    });
    const author = exec(`git log -1 --pretty=format:"%an" origin/${branchName}`, { silent: true });
    const date = exec(`git log -1 --pretty=format:"%ar" origin/${branchName}`, { silent: true });

    console.log(`  ${colorize('Commit:', 'gray')} ${commitHash.substring(0, 8)}`);
    console.log(`  ${colorize('Message:', 'gray')} ${commitMsg}`);
    console.log(`  ${colorize('Author:', 'gray')} ${author}`);
    console.log(`  ${colorize('Date:', 'gray')} ${date}`);

    // Check if branch can be merged cleanly
    const mainBranch = 'main';
    const mergeBase = exec(`git merge-base origin/${mainBranch} origin/${branchName}`, {
      silent: true,
      ignoreError: true,
    });

    if (!mergeBase) {
      console.log(`  ${colorize('✗', 'red')} Cannot find merge base with ${mainBranch}`);
      return { status: 'error', reason: 'no-merge-base' };
    }

    // Check for merge conflicts
    const currentBranch = exec('git branch --show-current', { silent: true });
    let hasConflicts = false;

    try {
      // Create a temporary test merge
      exec(`git checkout -b temp-merge-test-${Date.now()} origin/${mainBranch}`, { silent: true });
      exec(`git merge --no-commit --no-ff origin/${branchName}`, { silent: true });
      console.log(`  ${colorize('✓', 'green')} No merge conflicts detected`);
      exec('git merge --abort', { silent: true, ignoreError: true });
    } catch (error) {
      hasConflicts = true;
      console.log(`  ${colorize('⚠', 'yellow')} Merge conflicts detected`);
      exec('git merge --abort', { silent: true, ignoreError: true });
    } finally {
      exec(`git checkout ${currentBranch}`, { silent: true });
      exec(`git branch -D temp-merge-test-${Date.now()}`, { silent: true, ignoreError: true });
    }

    // Get diff stats
    const diffStats = exec(`git diff --shortstat origin/${mainBranch}...origin/${branchName}`, {
      silent: true,
      ignoreError: true,
    });
    if (diffStats) {
      console.log(`  ${colorize('Changes:', 'gray')} ${diffStats}`);
    }

    return {
      status: hasConflicts ? 'conflicts' : 'clean',
      commit: commitHash,
      message: commitMsg,
      author,
      date,
      conflicts: hasConflicts,
    };
  } catch (error) {
    console.log(`  ${colorize('✗', 'red')} Error analyzing branch: ${error.message}`);
    return { status: 'error', reason: error.message };
  }
}

/**
 * Generate analysis report
 */
function generateReport(branches, analysisResults) {
  console.log(
    colorize('\n\n═══════════════════════════════════════════════════════════════════════', 'cyan'),
  );
  console.log(colorize('  BRANCH ANALYSIS REPORT', 'bright'));
  console.log(
    colorize('═══════════════════════════════════════════════════════════════════════', 'cyan'),
  );

  console.log(`\n${colorize('Total Branches:', 'cyan')} ${branches.total}`);
  console.log(`  ${colorize('Codex:', 'gray')} ${branches.bySource.codex}`);
  console.log(`  ${colorize('Copilot:', 'gray')} ${branches.bySource.copilot}`);
  console.log(`  ${colorize('Claude:', 'gray')} ${branches.bySource.claude}`);

  const cleanBranches = analysisResults.filter((r) => r.status === 'clean');
  const conflictBranches = analysisResults.filter((r) => r.status === 'conflicts');
  const errorBranches = analysisResults.filter((r) => r.status === 'error');

  console.log(`\n${colorize('Branch Status:', 'cyan')}`);
  console.log(`  ${colorize('✓ Clean (can merge):', 'green')} ${cleanBranches.length}`);
  console.log(`  ${colorize('⚠ Has conflicts:', 'yellow')} ${conflictBranches.length}`);
  console.log(`  ${colorize('✗ Errors:', 'red')} ${errorBranches.length}`);

  console.log(colorize('\n\nRECOMMENDATIONS', 'bright'));
  console.log(colorize('─'.repeat(70), 'gray'));

  if (cleanBranches.length > 0) {
    console.log(`\n${colorize('Clean branches ready to merge:', 'green')}`);
    cleanBranches.slice(0, 10).forEach((b) => {
      console.log(`  • ${b.branch}`);
    });
    if (cleanBranches.length > 10) {
      console.log(`  ... and ${cleanBranches.length - 10} more`);
    }
  }

  if (conflictBranches.length > 0) {
    console.log(`\n${colorize('Branches needing conflict resolution:', 'yellow')}`);
    conflictBranches.slice(0, 10).forEach((b) => {
      console.log(`  • ${b.branch}`);
    });
    if (conflictBranches.length > 10) {
      console.log(`  ... and ${conflictBranches.length - 10} more`);
    }
  }

  console.log('\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  console.log(
    colorize('═══════════════════════════════════════════════════════════════════════', 'cyan'),
  );
  console.log(colorize('  ISTANI PR BRANCH ANALYZER', 'bright'));
  console.log(
    colorize('═══════════════════════════════════════════════════════════════════════', 'cyan'),
  );

  // Fetch latest branches
  console.log(colorize('\nFetching latest branches...', 'cyan'));
  exec('git fetch origin --prune');

  // Get all branches
  const branches = getFeatureBranches();

  if (args.includes('--branch')) {
    // Analyze specific branch
    const branchIdx = args.indexOf('--branch');
    const branchName = args[branchIdx + 1];
    if (!branchName) {
      console.error(colorize('Error: --branch requires a branch name', 'red'));
      process.exit(1);
    }
    analyzeBranch(branchName);
  } else {
    // Analyze all branches (or subset)
    console.log(colorize(`\nFound ${branches.total} feature branches`, 'cyan'));

    // Limit analysis to prevent overwhelming output
    const branchesToAnalyze = branches.all.slice(0, 20);
    console.log(colorize(`Analyzing first 20 branches for performance...`, 'gray'));

    const results = [];
    for (const branch of branchesToAnalyze) {
      const result = analyzeBranch(branch);
      results.push({ branch, ...result });
    }

    // Generate report
    generateReport(branches, results);

    // Save detailed results
    const reportPath = path.join(__dirname, 'pr-analysis-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          branches,
          results,
        },
        null,
        2,
      ),
    );
    console.log(colorize(`Detailed report saved to: ${reportPath}`, 'gray'));
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(colorize(`\nError: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { getFeatureBranches, analyzeBranch, generateReport };
