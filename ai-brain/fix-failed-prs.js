const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;

// Helper to run AI models
async function runAI(prompt, tool) {
  try {
    const { stdout } = await execAsync(
      `node ai-brain/${tool}-helper.js "${prompt.replace(/"/g, '\\"')}"`,
    );
    return stdout.trim();
  } catch (e) {
    console.error(`${tool} error: ${e.message}`);
    return `${tool} error: ${e.message}`;
  }
}

// Get all open PRs with their status
async function getAllOpenPRs() {
  try {
    const { stdout } = await execAsync(
      'gh pr list --state open --json number,title,state,mergeable,isDraft,statusCheckRollup,headRefName,baseRefName',
    );
    return JSON.parse(stdout);
  } catch (e) {
    console.error(`Error fetching PRs: ${e.message}`);
    return [];
  }
}

// Get detailed PR information
async function getPRDetails(prNumber) {
  try {
    const { stdout } = await execAsync(
      `gh pr view ${prNumber} --json title,body,files,mergeable,state,headRefName,baseRefName,url,statusCheckRollup`,
    );
    return JSON.parse(stdout);
  } catch (e) {
    console.error(`Error fetching PR ${prNumber}: ${e.message}`);
    return null;
  }
}

// Check if PR has failed checks
function hasFailedChecks(pr) {
  if (!pr.statusCheckRollup || pr.statusCheckRollup.length === 0) {
    return false;
  }

  return pr.statusCheckRollup.some((check) => {
    if (check.__typename === 'CheckRun') {
      return check.conclusion === 'FAILURE' || check.conclusion === 'CANCELLED';
    }
    if (check.__typename === 'StatusContext') {
      return check.state === 'FAILURE' || check.state === 'ERROR';
    }
    return false;
  });
}

// Check if PR has conflicts
function hasConflicts(pr) {
  return pr.mergeable === 'CONFLICTING';
}

// Resolve merge conflicts
async function resolveMergeConflicts(prNumber, prDetails) {
  console.log(`\n🔧 Resolving merge conflicts for PR #${prNumber}...`);

  try {
    // Get current branch
    let currentBranchName = 'main';
    try {
      const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
      currentBranchName = currentBranch.trim();
    } catch (e) {
      // If we're in detached HEAD, that's okay
    }

    // Fetch latest changes
    console.log('   Fetching latest changes...');
    await execAsync('git fetch origin --prune');

    // Checkout the PR branch
    await execAsync(`gh pr checkout ${prNumber}`);

    // Get the branch name
    const { stdout: branchName } = await execAsync('git rev-parse --abbrev-ref HEAD');
    const prBranchName = branchName.trim();

    // Try to merge base branch into PR branch
    try {
      await execAsync(`git merge origin/${prDetails.baseRefName} --no-edit`);
      console.log(`✅ Successfully merged ${prDetails.baseRefName} into ${prBranchName}`);
    } catch (mergeError) {
      // Check for conflicts
      const { stdout: conflictFiles } = await execAsync(
        'git diff --name-only --diff-filter=U 2>&1 || echo ""',
      );
      const conflicts = conflictFiles.trim().split('\n').filter(Boolean);

      if (conflicts.length > 0) {
        console.log(`⚠️  Found ${conflicts.length} conflicted files: ${conflicts.join(', ')}`);

        // Resolve each conflict using AI or smart fallback
        for (const file of conflicts) {
          try {
            console.log(`   Resolving conflict in ${file}...`);

            // For large files (like package-lock.json), use git strategy instead of AI
            const fileStats = await fs.stat(file).catch(() => null);
            const isLargeFile = fileStats && fileStats.size > 100000; // > 100KB
            const isLockFile =
              file.includes('package-lock.json') ||
              file.includes('yarn.lock') ||
              file.includes('pnpm-lock.yaml');

            if (isLargeFile || isLockFile) {
              // For lock files, prefer theirs (base branch) and regenerate if needed
              console.log(`   Using git strategy for large/lock file: ${file}`);
              try {
                await execAsync(`git checkout --theirs ${file}`);
                await execAsync(`git add ${file}`);
                console.log(`   ✅ Resolved ${file} using --theirs strategy`);

                // If it's a package-lock.json, try to regenerate it
                if (file.includes('package-lock.json')) {
                  try {
                    await execAsync('npm install --package-lock-only 2>&1 || true');
                    await execAsync(`git add ${file}`);
                    console.log(`   ✅ Regenerated ${file}`);
                  } catch (regenerateError) {
                    // Ignore regeneration errors
                  }
                }
              } catch (strategyError) {
                // Fallback to ours
                await execAsync(`git checkout --ours ${file}`);
                await execAsync(`git add ${file}`);
                console.log(`   ⚠️  Used --ours strategy for ${file}`);
              }
            } else {
              // For smaller files, use AI to resolve
              const content = await fs.readFile(file, 'utf8');

              // Limit content size for AI (first 50KB)
              const contentForAI =
                content.length > 50000
                  ? content.substring(0, 50000) + '\n... (truncated)'
                  : content;

              // Create prompt for AI to resolve conflict
              const prompt = `Resolve the merge conflict in ${file}. The file contains Git conflict markers (<<<<<<<, =======, >>>>>>>). Return ONLY the complete resolved file content without any conflict markers or explanations:\n\n${contentForAI}`;

              const resolved = await runAI(prompt, 'gemini');

              // Check if AI returned an error
              if (
                resolved.includes('error') ||
                resolved.includes('Error') ||
                resolved.includes('Set GEMINI_API_KEY')
              ) {
                throw new Error('AI resolution failed, using git strategy');
              }

              // Clean up the response (remove markdown code blocks if present)
              let cleanResolved = resolved;
              if (cleanResolved.includes('```')) {
                const codeBlockMatch = cleanResolved.match(/```[\w]*\n([\s\S]*?)\n```/);
                if (codeBlockMatch) {
                  cleanResolved = codeBlockMatch[1];
                }
              }

              // If AI response seems incomplete, fall back to git strategy
              if (cleanResolved.length < content.length * 0.5 || !cleanResolved.trim()) {
                throw new Error('AI response seems incomplete, using git strategy');
              }

              await fs.writeFile(file, cleanResolved, 'utf8');
              await execAsync(`git add ${file}`);
              console.log(`   ✅ Resolved conflict in ${file} using AI`);
            }
          } catch (fileError) {
            console.error(`   ❌ Error resolving ${file}: ${fileError.message}`);
            // Try to accept theirs (base branch) as fallback
            try {
              await execAsync(`git checkout --theirs ${file}`);
              await execAsync(`git add ${file}`);
              console.log(`   ⚠️  Used --theirs strategy for ${file}`);
            } catch (fallbackError) {
              // Last resort: accept ours
              try {
                await execAsync(`git checkout --ours ${file}`);
                await execAsync(`git add ${file}`);
                console.log(`   ⚠️  Used --ours strategy for ${file}`);
              } catch (lastResortError) {
                console.error(`   ❌ All strategies failed for ${file}`);
              }
            }
          }
        }

        // Complete the merge
        try {
          await execAsync('git commit -m "chore: resolve merge conflicts via AI Brain" --no-edit');
          console.log(`✅ Committed conflict resolution`);
        } catch (commitError) {
          // If commit fails, try with --allow-empty
          await execAsync(
            'git commit --allow-empty -m "chore: resolve merge conflicts via AI Brain"',
          );
        }
      }
    }

    // Push the resolved changes
    await execAsync(`git push origin ${prBranchName}`);
    console.log(`✅ Pushed resolved changes for PR #${prNumber}`);

    // Wait a bit for GitHub to update
    console.log('   Waiting for GitHub to update PR status...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Return to original branch (or main if detached)
    try {
      if (currentBranchName && currentBranchName !== prBranchName) {
        await execAsync(`git checkout ${currentBranchName} 2>&1 || git checkout main 2>&1 || true`);
      }
    } catch (e) {
      // Ignore checkout errors
    }

    return true;
  } catch (e) {
    console.error(`❌ Error resolving conflicts for PR #${prNumber}: ${e.message}`);
    return false;
  }
}

// Fix code issues based on failed checks
async function fixCodeIssues(prNumber, prDetails) {
  console.log(`\n🔧 Analyzing and fixing code issues for PR #${prNumber}...`);

  try {
    // Get the branch name
    let currentBranchName = 'main';
    try {
      const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
      currentBranchName = currentBranch.trim();
    } catch (e) {
      // If we're in detached HEAD, that's okay
    }

    // Fetch latest changes
    await execAsync('git fetch origin --prune');

    // Checkout the PR branch
    await execAsync(`gh pr checkout ${prNumber}`);

    const { stdout: branchName } = await execAsync('git rev-parse --abbrev-ref HEAD');
    const prBranchName = branchName.trim();

    // Get list of changed files
    const changedFiles = prDetails.files.map((f) => f.path).join(', ');

    // Analyze the PR with AI to identify and fix issues
    const prompt = `Review and fix the following pull request:
    
Title: ${prDetails.title}
Description: ${prDetails.body || 'No description'}
Changed files: ${changedFiles}

The PR has failed CI/CD checks. Please:
1. Identify potential issues in the code
2. Fix any syntax errors, linting issues, or logical problems
3. Ensure the code follows best practices

Return a detailed analysis and fixes. If you find issues, provide the corrected code for each file that needs changes.`;

    const analysis = await runAI(prompt, 'gemini');
    console.log(`📝 AI Analysis:\n${analysis.substring(0, 500)}...`);

    // Try to extract file fixes from the analysis
    // This is a simplified approach - in production, you'd want more sophisticated parsing
    const filePattern = /(?:File|file|FILE):\s*([^\n]+)\n([\s\S]*?)(?=(?:File|file|FILE):|$)/g;
    let match;
    let fixesApplied = false;

    while ((match = filePattern.exec(analysis)) !== null) {
      const fileName = match[1].trim();
      const fileContent = match[2].trim();

      // Check if file exists
      try {
        await fs.access(fileName);
        // Extract code block if present
        let code = fileContent;
        if (code.includes('```')) {
          const codeBlockMatch = code.match(/```[\w]*\n([\s\S]*?)\n```/);
          if (codeBlockMatch) {
            code = codeBlockMatch[1];
          }
        }

        await fs.writeFile(fileName, code, 'utf8');
        await execAsync(`git add ${fileName}`);
        fixesApplied = true;
        console.log(`   ✅ Applied fixes to ${fileName}`);
      } catch (fileError) {
        // File doesn't exist or can't be written, skip
        console.log(`   ⚠️  Skipping ${fileName} (not found or can't write)`);
      }
    }

    // If we applied fixes, commit them
    if (fixesApplied) {
      try {
        await execAsync('git commit -m "chore: fix code issues identified by AI Brain"');
        await execAsync(`git push origin ${prBranchName}`);
        console.log(`✅ Pushed fixes for PR #${prNumber}`);
        // Wait for GitHub to update
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (commitError) {
        console.log(`⚠️  No changes to commit or commit failed: ${commitError.message}`);
      }
    }

    // Return to original branch (or main if detached)
    try {
      if (currentBranchName && currentBranchName !== prBranchName) {
        await execAsync(`git checkout ${currentBranchName} 2>&1 || git checkout main 2>&1 || true`);
      }
    } catch (e) {
      // Ignore checkout errors
    }

    return fixesApplied;
  } catch (e) {
    console.error(`❌ Error fixing code issues for PR #${prNumber}: ${e.message}`);
    return false;
  }
}

// Wait for checks to pass (with timeout)
async function waitForChecksToPass(prNumber, timeoutMinutes = 10) {
  console.log(`\n⏳ Waiting for checks to pass for PR #${prNumber}...`);

  const startTime = Date.now();
  const timeout = timeoutMinutes * 60 * 1000;
  const checkInterval = 30000; // Check every 30 seconds

  while (Date.now() - startTime < timeout) {
    const prDetails = await getPRDetails(prNumber);

    if (!prDetails) {
      console.log(`❌ Could not fetch PR details`);
      return false;
    }

    // Check if all checks are passing
    const hasFailures = hasFailedChecks(prDetails);
    const hasConflicts = hasConflicts(prDetails);

    if (!hasFailures && !hasConflicts && prDetails.mergeable === 'MERGEABLE') {
      console.log(`✅ All checks passed for PR #${prNumber}`);
      return true;
    }

    // Check if checks are still running
    const checksRunning = prDetails.statusCheckRollup?.some((check) => {
      if (check.__typename === 'CheckRun') {
        return check.status === 'IN_PROGRESS' || check.status === 'QUEUED';
      }
      return false;
    });

    if (checksRunning) {
      console.log(`   ⏳ Checks still running, waiting...`);
    } else if (hasFailures || hasConflicts) {
      console.log(`   ⚠️  Some checks still failing or conflicts remain`);
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  console.log(`⏰ Timeout waiting for checks to pass for PR #${prNumber}`);
  return false;
}

// Merge the PR
async function mergePR(prNumber) {
  console.log(`\n🔀 Merging PR #${prNumber}...`);

  try {
    // Try squash merge first (most common)
    try {
      await execAsync(`gh pr merge ${prNumber} --squash --auto`);
      console.log(`✅ Successfully merged PR #${prNumber} (squash)`);
      return true;
    } catch (squashError) {
      // Try merge commit
      try {
        await execAsync(`gh pr merge ${prNumber} --merge --auto`);
        console.log(`✅ Successfully merged PR #${prNumber} (merge)`);
        return true;
      } catch (mergeError) {
        // Try rebase
        try {
          await execAsync(`gh pr merge ${prNumber} --rebase --auto`);
          console.log(`✅ Successfully merged PR #${prNumber} (rebase)`);
          return true;
        } catch (rebaseError) {
          console.error(`❌ Failed to merge PR #${prNumber}: ${rebaseError.message}`);
          return false;
        }
      }
    }
  } catch (e) {
    console.error(`❌ Error merging PR #${prNumber}: ${e.message}`);
    return false;
  }
}

// Main function to fix and merge a PR
async function fixAndMergePR(prNumber) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Processing PR #${prNumber}`);
  console.log(`${'='.repeat(60)}`);

  const prDetails = await getPRDetails(prNumber);
  if (!prDetails) {
    console.log(`❌ Could not fetch PR details for #${prNumber}`);
    return false;
  }

  console.log(`📋 PR: ${prDetails.title}`);
  console.log(`🔗 URL: ${prDetails.url}`);

  // Check for conflicts
  if (hasConflicts(prDetails)) {
    console.log(`⚠️  PR has merge conflicts`);
    const conflictResolved = await resolveMergeConflicts(prNumber, prDetails);
    if (!conflictResolved) {
      console.log(`❌ Failed to resolve conflicts for PR #${prNumber}`);
      return false;
    }

    // Wait a bit for GitHub to update
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Check for failed checks
  if (hasFailedChecks(prDetails)) {
    console.log(`⚠️  PR has failed checks`);
    await fixCodeIssues(prNumber, prDetails);

    // Wait for checks to re-run
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // Wait for checks to pass
  const checksPassed = await waitForChecksToPass(prNumber, 15);

  if (!checksPassed) {
    // Re-check PR status
    const updatedPR = await getPRDetails(prNumber);
    if (hasConflicts(updatedPR) || hasFailedChecks(updatedPR)) {
      console.log(`❌ PR #${prNumber} still has issues after fixes`);
      return false;
    }
  }

  // Merge the PR
  const merged = await mergePR(prNumber);

  if (merged) {
    console.log(`\n✅ Successfully fixed and merged PR #${prNumber}`);
  } else {
    console.log(`\n❌ Failed to merge PR #${prNumber}`);
  }

  return merged;
}

// Ensure git is configured
async function ensureGitConfig() {
  try {
    await execAsync('git config user.name || git config --global user.name "AI Brain Bot"');
    await execAsync(
      'git config user.email || git config --global user.email "ai-brain@istani.org"',
    );
  } catch (e) {
    // Ignore errors
  }
}

// Main execution
async function main() {
  console.log('🔍 Finding all failed pull requests...\n');

  // Ensure git is configured
  await ensureGitConfig();

  const prs = await getAllOpenPRs();
  console.log(`Found ${prs.length} open PR(s)\n`);

  // Filter for PRs that need fixing
  const failedPRs = prs.filter((pr) => {
    if (pr.isDraft) return false;
    return hasConflicts(pr) || hasFailedChecks(pr);
  });

  if (failedPRs.length === 0) {
    console.log('✅ No failed PRs found! All PRs are in good shape.');
    return;
  }

  console.log(`Found ${failedPRs.length} PR(s) that need fixing:\n`);
  failedPRs.forEach((pr) => {
    const issues = [];
    if (hasConflicts(pr)) issues.push('CONFLICTS');
    if (hasFailedChecks(pr)) issues.push('FAILED_CHECKS');
    console.log(`  - PR #${pr.number}: ${pr.title} [${issues.join(', ')}]`);
  });

  console.log(`\n🚀 Starting automated fix and merge process...\n`);

  // Process each PR
  for (const pr of failedPRs) {
    try {
      await fixAndMergePR(pr.number);
      // Wait between PRs to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`\n❌ Error processing PR #${pr.number}: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ Finished processing all PRs');
  console.log(`${'='.repeat(60)}\n`);
}

// Run the script
main().catch(console.error);
