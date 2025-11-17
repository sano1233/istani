#!/usr/bin/env node
/**
 * Automated Merger - Consensus-Based PR Approval and Merging
 *
 * Features:
 * - Multi-AI consensus approval (2/3 required)
 * - Comprehensive code review analysis
 * - Security and quality checks
 * - Automatic conflict resolution integration
 * - Smart merge strategy selection
 * - Rollback capability
 *
 * Usage: node ai-brain/automated-merger.js [options]
 * Options:
 *   --pr <number>        Merge specific PR
 *   --all                Process all open PRs
 *   --require <n>        Require n/3 AI approvals (default: 2)
 *   --auto-fix           Auto-fix issues before merging
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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Statistics tracking
const mergeStats = {
  totalPRs: 0,
  analyzed: 0,
  approved: 0,
  rejected: 0,
  merged: 0,
  failed: 0,
};

/**
 * Run AI helper to get review
 */
async function runAI(prompt, tool = 'gemini') {
  try {
    const helperPath = path.join(__dirname, `${tool}-helper.js`);
    const { stdout, stderr } = await execAsync(`node "${helperPath}"`, {
      input: prompt,
      timeout: 45000, // 45 seconds for complex reviews
      maxBuffer: 3 * 1024 * 1024, // 3MB buffer
    });

    if (stderr && !stderr.includes('Warning')) {
      log(`   ${tool} warning: ${stderr}`, 'yellow');
    }

    return stdout.trim();
  } catch (error) {
    log(`   ${tool} error: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Get PR details from GitHub
 */
async function getPRDetails(prNumber) {
  try {
    const { stdout } = await execAsync(
      `gh pr view ${prNumber} --json number,title,body,state,mergeable,mergeStateStatus,files,author,createdAt,url,headRefName,baseRefName,commits`,
    );
    return JSON.parse(stdout);
  } catch (error) {
    log(`   ❌ Failed to fetch PR details: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Get all open PRs
 */
async function getAllOpenPRs() {
  try {
    const { stdout } = await execAsync(
      `gh pr list --state open --json number,title,author,createdAt,mergeable --limit 100`,
    );
    return JSON.parse(stdout);
  } catch (error) {
    log(`   ❌ Failed to fetch PRs: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Run comprehensive code review with AI
 */
async function performAICodeReview(prDetails) {
  log(`\n🤖 Performing AI code review...`, 'cyan');

  // Prepare review prompt
  const files = prDetails.files || [];
  const changedFiles = files.map((f) => `${f.path} (+${f.additions}/-${f.deletions})`).join('\n  ');

  const reviewPrompt = `You are an expert code reviewer. Perform a comprehensive review of this pull request:

**PR Title**: ${prDetails.title}
**Author**: ${prDetails.author?.login || 'Unknown'}
**Description**: ${prDetails.body || 'No description provided'}

**Changed Files** (${files.length} files):
  ${changedFiles}

**Total Changes**: +${files.reduce((sum, f) => sum + f.additions, 0)} / -${files.reduce((sum, f) => sum + f.deletions, 0)}

Please review this PR and provide your assessment in this EXACT format:

DECISION: [APPROVE/REQUEST_CHANGES/COMMENT]
CONFIDENCE: [HIGH/MEDIUM/LOW]

SUMMARY:
[One paragraph summary of the changes]

STRENGTHS:
- [List positive aspects]

CONCERNS:
- [List any issues or concerns]

SECURITY:
[Any security considerations]

RECOMMENDATION:
[Your final recommendation]

Be thorough but concise. Focus on:
1. Code quality and best practices
2. Security vulnerabilities
3. Potential bugs or issues
4. Architecture and design
5. Testing adequacy`;

  // Get reviews from all AI models in parallel
  log(`   Consulting AI models...`, 'cyan');

  const [geminiReview, claudeReview, qwenReview] = await Promise.all([
    runAI(reviewPrompt, 'gemini'),
    runAI(reviewPrompt, 'claude'),
    runAI(reviewPrompt, 'qwen'),
  ]);

  const reviews = {
    gemini: geminiReview,
    claude: claudeReview,
    qwen: qwenReview,
  };

  // Parse reviews and extract decisions
  const decisions = {};
  const approvals = [];

  for (const [model, review] of Object.entries(reviews)) {
    if (!review || review.includes('error')) {
      log(`   ⚠️  ${model}: Unable to complete review`, 'yellow');
      decisions[model] = { decision: 'ERROR', confidence: 'LOW', review: null };
      continue;
    }

    // Extract decision
    const decisionMatch = review.match(/DECISION:\s*(APPROVE|REQUEST_CHANGES|COMMENT)/i);
    const confidenceMatch = review.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i);

    const decision = decisionMatch ? decisionMatch[1].toUpperCase() : 'COMMENT';
    const confidence = confidenceMatch ? confidenceMatch[1].toUpperCase() : 'MEDIUM';

    decisions[model] = { decision, confidence, review };

    if (decision === 'APPROVE') {
      approvals.push(model);
      log(`   ✅ ${model}: APPROVE (${confidence} confidence)`, 'green');
    } else if (decision === 'REQUEST_CHANGES') {
      log(`   ❌ ${model}: REQUEST_CHANGES (${confidence} confidence)`, 'red');
    } else {
      log(`   💬 ${model}: COMMENT (${confidence} confidence)`, 'yellow');
    }
  }

  return { reviews, decisions, approvals };
}

/**
 * Post AI review as PR comment
 */
async function postReviewComment(prNumber, reviews, approvals, requiredApprovals) {
  try {
    const reviewSections = Object.entries(reviews)
      .filter(([_, review]) => review && !review.includes('error'))
      .map(([model, review]) => `### ${model.toUpperCase()}\n\n${review}`)
      .join('\n\n---\n\n');

    const consensusStatus =
      approvals.length >= requiredApprovals
        ? '✅ **CONSENSUS REACHED** - PR approved for merge'
        : `⚠️ **CONSENSUS NOT REACHED** - Need ${requiredApprovals}/${Object.keys(reviews).length} approvals (got ${approvals.length})`;

    const comment = `## 🤖 AI Brain - Automated Code Review

${consensusStatus}

**Approvals**: ${approvals.length}/${Object.keys(reviews).length} (${approvals.join(', ')})
**Required**: ${requiredApprovals}/${Object.keys(reviews).length}

---

## Detailed Reviews

${reviewSections}

---

*This review was automatically generated by AI Brain - Automated Merger*
*Timestamp: ${new Date().toISOString()}*`;

    // Write to temp file and post
    const tempFile = path.join(__dirname, '.temp-review.txt');
    await fs.writeFile(tempFile, comment, 'utf8');

    try {
      await execAsync(`gh pr comment ${prNumber} --body-file "${tempFile}"`);
      log(`   ✅ Posted review comment to PR #${prNumber}`, 'green');
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  } catch (error) {
    log(`   ⚠️  Failed to post comment: ${error.message}`, 'yellow');
  }
}

/**
 * Check if PR is ready for merge
 */
async function checkMergeReadiness(prDetails) {
  log(`\n🔍 Checking merge readiness...`, 'cyan');

  const checks = {
    state: prDetails.state === 'OPEN',
    mergeable: prDetails.mergeable === 'MERGEABLE',
    conflicts: prDetails.mergeStateStatus !== 'DIRTY',
    notDraft: !prDetails.isDraft,
  };

  log(`   State: ${checks.state ? '✅' : '❌'} ${prDetails.state}`, checks.state ? 'green' : 'red');
  log(
    `   Mergeable: ${checks.mergeable ? '✅' : '❌'} ${prDetails.mergeable || 'UNKNOWN'}`,
    checks.mergeable ? 'green' : 'yellow',
  );
  log(`   No conflicts: ${checks.conflicts ? '✅' : '❌'}`, checks.conflicts ? 'green' : 'red');
  log(`   Not draft: ${checks.notDraft ? '✅' : '❌'}`, checks.notDraft ? 'green' : 'yellow');

  const ready = Object.values(checks).every((c) => c);

  if (!ready) {
    log(`   ⚠️  PR not ready for merge`, 'yellow');
  }

  return { ready, checks };
}

/**
 * Merge PR using best strategy
 */
async function mergePR(prNumber, strategy = 'auto') {
  log(`\n🔀 Merging PR #${prNumber}...`, 'cyan');

  // Determine merge strategy
  let mergeStrategy = strategy;

  if (strategy === 'auto') {
    // Auto-select strategy based on PR
    const prDetails = await getPRDetails(prNumber);
    const commitCount = prDetails.commits?.length || 1;

    if (commitCount === 1) {
      mergeStrategy = 'squash';
      log(`   Using squash merge (single commit)`, 'cyan');
    } else if (commitCount > 10) {
      mergeStrategy = 'squash';
      log(`   Using squash merge (many commits: ${commitCount})`, 'cyan');
    } else {
      mergeStrategy = 'merge';
      log(`   Using merge commit (preserves history: ${commitCount} commits)`, 'cyan');
    }
  }

  // Try to merge with selected strategy
  const strategies = [
    { name: mergeStrategy, flag: `--${mergeStrategy}` },
    { name: 'squash', flag: '--squash' },
    { name: 'merge', flag: '--merge' },
    { name: 'rebase', flag: '--rebase' },
  ];

  for (const strat of strategies) {
    try {
      log(`   Attempting ${strat.name} merge...`, 'cyan');
      await execAsync(`gh pr merge ${prNumber} ${strat.flag} --auto --delete-branch`);
      log(`   ✅ Successfully merged using ${strat.name}`, 'green');
      return { success: true, strategy: strat.name };
    } catch (error) {
      if (strat === strategies[strategies.length - 1]) {
        // Last strategy failed
        log(`   ❌ All merge strategies failed`, 'red');
        return { success: false, error: error.message };
      }
      // Try next strategy
      continue;
    }
  }

  return { success: false, error: 'No merge strategy succeeded' };
}

/**
 * Process a single PR through the complete workflow
 */
async function processPR(prNumber, options = {}) {
  const { requiredApprovals = 2, autoFix = false } = options;

  log('\n' + '═'.repeat(70), 'cyan');
  log(`  PROCESSING PR #${prNumber}`, 'bright');
  log('═'.repeat(70), 'cyan');

  mergeStats.totalPRs++;

  // 1. Get PR details
  log(`\n📋 Fetching PR details...`, 'cyan');
  const prDetails = await getPRDetails(prNumber);

  if (!prDetails) {
    log(`   ❌ Could not fetch PR details`, 'red');
    mergeStats.failed++;
    return { success: false, reason: 'fetch_failed' };
  }

  log(`   ✅ PR: ${prDetails.title}`, 'green');
  log(`   Author: ${prDetails.author?.login || 'Unknown'}`, 'gray');
  log(`   URL: ${prDetails.url}`, 'gray');

  mergeStats.analyzed++;

  // 2. Check merge readiness
  const { ready, checks } = await checkMergeReadiness(prDetails);

  // 3. Auto-fix if requested and needed
  if (!ready && autoFix) {
    log(`\n🔧 Auto-fixing issues...`, 'cyan');

    // Fix conflicts if present
    if (!checks.conflicts) {
      log(`   Resolving conflicts...`, 'cyan');
      try {
        const conflictResolver = require('./intelligent-conflict-resolver');
        await conflictResolver.resolveAllConflicts({ prNumber });
        log(`   ✅ Conflicts resolved`, 'green');
      } catch (error) {
        log(`   ⚠️  Could not auto-resolve conflicts: ${error.message}`, 'yellow');
      }
    }

    // Run code fixes
    log(`   Running code quality fixes...`, 'cyan');
    try {
      const codeFixer = require('./automated-code-fixer');
      await codeFixer.runESLintFix();
      await codeFixer.runPrettierFix();
      log(`   ✅ Code quality fixes applied`, 'green');
    } catch (error) {
      log(`   ⚠️  Some fixes failed: ${error.message}`, 'yellow');
    }

    // Re-check readiness
    const updatedPR = await getPRDetails(prNumber);
    const { ready: nowReady } = await checkMergeReadiness(updatedPR);

    if (!nowReady) {
      log(`   ⚠️  PR still not ready after auto-fix`, 'yellow');
      mergeStats.failed++;
      return { success: false, reason: 'not_ready_after_fix' };
    }
  } else if (!ready) {
    log(`   ⚠️  PR not ready for merge (use --auto-fix to attempt fixes)`, 'yellow');
    mergeStats.failed++;
    return { success: false, reason: 'not_ready' };
  }

  // 4. Perform AI code review
  const { reviews, decisions, approvals } = await performAICodeReview(prDetails);

  // 5. Post review comment
  await postReviewComment(prNumber, reviews, approvals, requiredApprovals);

  // 6. Check consensus
  log(`\n📊 Consensus Check:`, 'cyan');
  log(`   Approvals: ${approvals.length}/${Object.keys(reviews).length}`, 'gray');
  log(`   Required: ${requiredApprovals}`, 'gray');

  const hasConsensus = approvals.length >= requiredApprovals;

  if (!hasConsensus) {
    log(`   ❌ Consensus not reached`, 'red');
    log(`   Need ${requiredApprovals - approvals.length} more approval(s)`, 'yellow');
    mergeStats.rejected++;
    return { success: false, reason: 'no_consensus', approvals: approvals.length };
  }

  log(`   ✅ Consensus reached! ${approvals.join(', ')} approved`, 'green');
  mergeStats.approved++;

  // 7. Approve the PR
  log(`\n👍 Approving PR...`, 'cyan');
  try {
    await execAsync(
      `gh pr review ${prNumber} --approve --body "Approved by AI Brain consensus (${approvals.join(', ')})"`,
    );
    log(`   ✅ PR approved`, 'green');
  } catch (error) {
    log(`   ⚠️  Could not approve PR: ${error.message}`, 'yellow');
  }

  // 8. Merge the PR
  const mergeResult = await mergePR(prNumber);

  if (mergeResult.success) {
    log(`   ✅ PR merged successfully!`, 'green');
    mergeStats.merged++;
    return { success: true, strategy: mergeResult.strategy, approvals: approvals.length };
  } else {
    log(`   ❌ Merge failed: ${mergeResult.error}`, 'red');
    mergeStats.failed++;
    return { success: false, reason: 'merge_failed', error: mergeResult.error };
  }
}

/**
 * Process all open PRs
 */
async function processAllPRs(options = {}) {
  log('═'.repeat(70), 'cyan');
  log('  AUTOMATED MERGER - BATCH PROCESSING', 'bright');
  log('═'.repeat(70), 'cyan');

  log(`\n🔍 Fetching all open PRs...`, 'cyan');
  const prs = await getAllOpenPRs();

  log(`   Found ${prs.length} open PRs`, 'cyan');

  if (prs.length === 0) {
    log(`   ✅ No open PRs to process`, 'green');
    return;
  }

  // Filter out draft PRs
  const nonDraftPRs = prs.filter((pr) => !pr.isDraft);
  log(`   Processing ${nonDraftPRs.length} non-draft PRs`, 'cyan');

  const results = [];

  for (const pr of nonDraftPRs) {
    try {
      const result = await processPR(pr.number, options);
      results.push({ pr: pr.number, ...result });

      // Wait between PRs to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      log(`\n❌ Error processing PR #${pr.number}: ${error.message}`, 'red');
      results.push({ pr: pr.number, success: false, error: error.message });
    }
  }

  // Generate summary
  log('\n' + '═'.repeat(70), 'cyan');
  log('  BATCH PROCESSING SUMMARY', 'bright');
  log('═'.repeat(70), 'cyan');

  log(`\n📊 Statistics:`, 'cyan');
  log(`   Total PRs: ${mergeStats.totalPRs}`, 'gray');
  log(`   Analyzed: ${mergeStats.analyzed}`, 'gray');
  log(`   Approved: ${mergeStats.approved}`, 'green');
  log(`   Rejected: ${mergeStats.rejected}`, 'yellow');
  log(`   Merged: ${mergeStats.merged}`, 'green');
  log(`   Failed: ${mergeStats.failed}`, 'red');

  if (mergeStats.totalPRs > 0) {
    const successRate = Math.round((mergeStats.merged / mergeStats.totalPRs) * 100);
    log(
      `\n   Success rate: ${successRate}%`,
      successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red',
    );
  }

  log('\n═'.repeat(70), 'cyan');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Automated Merger - Consensus-Based PR Approval and Merging

Usage: node ai-brain/automated-merger.js [options]

Options:
  --pr <number>        Merge specific PR
  --all                Process all open PRs
  --require <n>        Require n/3 AI approvals (default: 2)
  --auto-fix           Auto-fix issues before merging
  --help, -h           Show this help message

Examples:
  node ai-brain/automated-merger.js --pr 123
  node ai-brain/automated-merger.js --all --auto-fix
  node ai-brain/automated-merger.js --pr 456 --require 3 --auto-fix
`);
    return;
  }

  const options = {
    requiredApprovals: 2,
    autoFix: args.includes('--auto-fix'),
  };

  // Parse required approvals
  const requireIndex = args.indexOf('--require');
  if (requireIndex >= 0) {
    options.requiredApprovals = parseInt(args[requireIndex + 1]) || 2;
  }

  // Process specific PR or all PRs
  const prIndex = args.indexOf('--pr');
  if (prIndex >= 0) {
    const prNumber = args[prIndex + 1];
    if (!prNumber) {
      log('❌ Error: --pr requires a PR number', 'red');
      process.exit(1);
    }
    await processPR(prNumber, options);
  } else if (args.includes('--all')) {
    await processAllPRs(options);
  } else {
    log('❌ Error: Either --pr <number> or --all is required', 'red');
    log('Use --help for usage information', 'gray');
    process.exit(1);
  }
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
  processPR,
  processAllPRs,
  performAICodeReview,
  checkMergeReadiness,
  mergePR,
  getPRDetails,
  getAllOpenPRs,
};
