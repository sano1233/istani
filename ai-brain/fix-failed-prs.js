const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const execAsync = promisify(exec);

async function getAllPRs() {
  try {
    const { stdout } = await execAsync('gh pr list --state open --json number,title,state,mergeable,statusCheckRollup,headRefName,baseRefName');
    return JSON.parse(stdout);
  } catch (e) {
    console.error('Error fetching PRs:', e.message);
    return [];
  }
}

function hasFailures(pr) {
  if (!pr.statusCheckRollup || pr.statusCheckRollup.length === 0) {
    return false;
  }
  
  return pr.statusCheckRollup.some(check => {
    if (check.conclusion === 'FAILURE' || check.state === 'FAILURE') {
      return true;
    }
    return false;
  });
}

function isConflicting(pr) {
  return pr.mergeable === 'CONFLICTING';
}

async function runAI(prompt, tool = 'gemini') {
  try {
    // Try both paths - from workspace root or from ai-brain directory
    const path = require('path');
    const fs = require('fs');
    let helperPath = path.join(__dirname, `${tool}-helper.js`);
    if (!fs.existsSync(helperPath)) {
      helperPath = path.join(__dirname, '..', 'ai-brain', `${tool}-helper.js`);
    }
    const { stdout } = await execAsync(`node "${helperPath}" "${prompt.replace(/"/g, '\\"')}"`);
    return stdout.trim();
  } catch (e) {
    console.error(`${tool} error:`, e.message);
    return null;
  }
}

async function resolveConflicts(prNumber, headRef) {
  console.log(`\n🔧 Resolving conflicts for PR #${prNumber}...`);
  
  try {
    // Clean up any existing merge state
    try {
      await execAsync('git merge --abort 2>/dev/null || true');
      await execAsync('git reset --hard HEAD 2>/dev/null || true');
      await execAsync('git clean -fd 2>/dev/null || true');
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // Get current branch
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
    const originalBranch = currentBranch.trim();
    
    // Fetch latest
    await execAsync('git fetch origin');
    
    // Checkout PR branch
    await execAsync(`git checkout ${headRef}`);
    
    // Try to merge base branch
    try {
      await execAsync('git merge origin/main || git merge origin/master');
    } catch (mergeError) {
      // Expected to fail if there are conflicts
    }
    
    // Find conflicted files
    const { stdout: conflictedFiles } = await execAsync('git diff --name-only --diff-filter=U 2>/dev/null || echo ""');
    const conflicts = conflictedFiles.trim().split('\n').filter(Boolean);
    
    if (conflicts.length === 0) {
      console.log(`✅ No conflicts found for PR #${prNumber}`);
      await execAsync(`git checkout ${originalBranch}`);
      return true;
    }
    
    console.log(`Found ${conflicts.length} conflicted file(s): ${conflicts.join(', ')}`);
    
    // Resolve each conflict using AI or fallback strategy
    for (const file of conflicts) {
      try {
        // Skip very large files (like package-lock.json) - use automatic resolution
        const { stdout: fileSize } = await execAsync(`wc -c < ${file} 2>/dev/null || echo 0`);
        const size = parseInt(fileSize.trim());
        
        if (size > 100000) { // Files larger than 100KB
          console.log(`⚠️  File ${file} is too large (${size} bytes), using automatic resolution`);
          await execAsync(`git checkout --theirs ${file}`);
          await execAsync(`git add ${file}`);
          console.log(`✅ Auto-resolved large file ${file}`);
          continue;
        }
        
        const { stdout: content } = await execAsync(`cat ${file}`);
        const prompt = `Resolve merge conflict in ${file}. Return only the resolved code without conflict markers. Keep both changes where appropriate:\n${content}`;
        const resolved = await runAI(prompt, 'gemini');
        
        if (resolved && resolved.length > 0) {
          // Write resolved content to file
          const fs = require('fs');
          fs.writeFileSync(file, resolved);
          await execAsync(`git add ${file}`);
          console.log(`✅ Resolved conflict in ${file} using AI`);
        } else {
          // Fallback: use theirs (incoming changes)
          await execAsync(`git checkout --theirs ${file}`);
          await execAsync(`git add ${file}`);
          console.log(`⚠️  Used theirs for ${file} (AI resolution failed)`);
        }
      } catch (fileError) {
        console.error(`❌ Error resolving ${file}:`, fileError.message);
        // Try to resolve manually by accepting theirs
        try {
          await execAsync(`git checkout --theirs ${file}`);
          await execAsync(`git add ${file}`);
          console.log(`⚠️  Used theirs for ${file} (fallback)`);
        } catch (e) {
          console.error(`Failed to resolve ${file}:`, e.message);
          // Last resort: remove the file if it's causing issues
          try {
            await execAsync(`git rm --cached ${file} 2>/dev/null || true`);
          } catch (rmError) {
            // Ignore
          }
        }
      }
    }
    
    // Commit the resolution
    await execAsync('git commit -m "Auto-resolve conflicts via AI Brain" --no-edit || git commit -m "Auto-resolve conflicts via AI Brain"');
    
    // Push the fix
    await execAsync(`git push origin ${headRef}`);
    console.log(`✅ Conflicts resolved and pushed for PR #${prNumber}`);
    
    // Return to original branch
    try {
      await execAsync(`git checkout ${originalBranch}`);
    } catch (checkoutError) {
      // If checkout fails, try to checkout main/master
      try {
        await execAsync('git checkout main || git checkout master');
      } catch (e) {
        console.error('Warning: Could not return to original branch');
      }
    }
    
    return true;
  } catch (e) {
    console.error(`❌ Error resolving conflicts for PR #${prNumber}:`, e.message);
    // Clean up and return to original branch
    try {
      await execAsync('git merge --abort 2>/dev/null || true');
      await execAsync('git reset --hard HEAD 2>/dev/null || true');
      const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
      const current = currentBranch.trim();
      // Try to go back to main/master if we're on a PR branch
      if (current !== 'main' && current !== 'master') {
        await execAsync('git checkout main || git checkout master');
      }
    } catch (checkoutError) {
      // Ignore checkout errors
    }
    return false;
  }
}

async function analyzeCIFailures(pr) {
  const failures = pr.statusCheckRollup.filter(check => 
    check.conclusion === 'FAILURE' || check.state === 'FAILURE'
  );
  
  if (failures.length === 0) {
    return null;
  }
  
  const failureDetails = failures.map(f => ({
    name: f.name || f.context,
    workflow: f.workflowName || '',
    url: f.detailsUrl || f.targetUrl || ''
  }));
  
  return failureDetails;
}

async function fixCIFailures(prNumber, headRef, failures) {
  console.log(`\n🔧 Analyzing CI failures for PR #${prNumber}...`);
  
  // Get PR details
  const { stdout: prDetails } = await execAsync(`gh pr view ${prNumber} --json title,body,files,commits`);
  const prData = JSON.parse(prDetails);
  
  // Get changed files
  const changedFiles = prData.files.map(f => f.path).join(', ');
  
  // Analyze failures with AI
  const failureSummary = failures.map(f => `${f.name} (${f.workflow})`).join(', ');
  const prompt = `PR #${prNumber}: ${prData.title}\n\nChanged files: ${changedFiles}\n\nFailed checks: ${failureSummary}\n\nAnalyze the failures and suggest fixes. If it's a deployment failure (Cloudflare/Vercel), it might be a configuration issue. If it's a test failure, suggest code fixes.`;
  
  const analysis = await runAI(prompt, 'gemini');
  
  if (analysis) {
    // Post analysis as comment
    const comment = `## 🔧 AI Analysis of CI Failures\n\n${analysis}\n\n**Failed Checks:**\n${failures.map(f => `- ${f.name}: ${f.url || 'N/A'}`).join('\n')}`;
    await execAsync(`gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
  }
  
  // For deployment failures, try to trigger a rebuild
  const deploymentFailures = failures.filter(f => 
    f.name.includes('Cloudflare') || f.name.includes('Vercel') || f.name.includes('Pages')
  );
  
  if (deploymentFailures.length > 0) {
    console.log(`⚠️  Deployment failures detected. These may resolve after conflict resolution.`);
  }
  
  // For test failures, we'd need to checkout and fix, but that's complex
  // For now, we'll rely on conflict resolution and re-running checks
  return true;
}

async function mergePR(prNumber) {
  console.log(`\n✅ Attempting to merge PR #${prNumber}...`);
  
  try {
    // Check if PR is mergeable
    const { stdout: prStatus } = await execAsync(`gh pr view ${prNumber} --json mergeable,mergeStateStatus`);
    const status = JSON.parse(prStatus);
    
    if (status.mergeable === false || status.mergeable === 'CONFLICTING') {
      console.log(`⚠️  PR #${prNumber} is not mergeable yet. May need more fixes.`);
      return false;
    }
    
    // Check if all checks pass
    const { stdout: checks } = await execAsync(`gh pr checks ${prNumber} --json name,conclusion,state`);
    const checkResults = JSON.parse(checks);
    const failedChecks = checkResults.filter(c => 
      c.conclusion === 'FAILURE' || c.state === 'FAILURE'
    );
    
    if (failedChecks.length > 0) {
      console.log(`⚠️  PR #${prNumber} still has ${failedChecks.length} failing check(s). Skipping merge.`);
      return false;
    }
    
    // Merge the PR
    await execAsync(`gh pr merge ${prNumber} --squash --auto`);
    console.log(`✅ Successfully merged PR #${prNumber}`);
    return true;
  } catch (e) {
    console.error(`❌ Error merging PR #${prNumber}:`, e.message);
    return false;
  }
}

async function fixAndMergePR(pr) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing PR #${pr.number}: ${pr.title}`);
  console.log(`${'='.repeat(60)}`);
  
  let needsFix = false;
  let fixed = false;
  
  // Check for conflicts
  if (isConflicting(pr)) {
    console.log(`⚠️  PR #${pr.number} has merge conflicts`);
    needsFix = true;
    fixed = await resolveConflicts(pr.number, pr.headRefName);
    
    if (fixed) {
      // Wait a bit for GitHub to update status
      console.log('⏳ Waiting for GitHub to update PR status...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Refresh PR data
      const { stdout: updatedPR } = await execAsync(`gh pr view ${pr.number} --json number,title,state,mergeable,statusCheckRollup,headRefName`);
      pr = JSON.parse(updatedPR);
    }
  }
  
  // Check for CI failures
  if (hasFailures(pr)) {
    console.log(`⚠️  PR #${pr.number} has CI failures`);
    needsFix = true;
    const failures = analyzeCIFailures(pr);
    if (failures && Array.isArray(failures) && failures.length > 0) {
      await fixCIFailures(pr.number, pr.headRefName, failures);
    }
  }
  
  // If conflicts were resolved, try to merge
  if (fixed || !needsFix) {
    // Check if mergeable now
    if (pr.mergeable === true || pr.mergeable === 'MERGEABLE') {
      if (!hasFailures(pr)) {
        await mergePR(pr.number);
      } else {
        console.log(`⚠️  PR #${pr.number} is mergeable but still has failing checks. May need manual intervention.`);
      }
    } else if (pr.mergeable === 'UNKNOWN') {
      console.log(`⚠️  PR #${pr.number} mergeable status is UNKNOWN. Checking again...`);
      // Wait and check again
      await new Promise(resolve => setTimeout(resolve, 10000));
      const { stdout: updatedPR } = await execAsync(`gh pr view ${pr.number} --json mergeable,statusCheckRollup`);
      const updated = JSON.parse(updatedPR);
      if (updated.mergeable === true && !hasFailures({ statusCheckRollup: updated.statusCheckRollup })) {
        await mergePR(pr.number);
      }
    }
  }
  
  return fixed;
}

async function main() {
  console.log('🚀 Starting failed PR fixer and merger...\n');
  
  const prs = await getAllPRs();
  console.log(`Found ${prs.length} open PR(s)\n`);
  
  const failedPRs = prs.filter(pr => isConflicting(pr) || hasFailures(pr));
  console.log(`Found ${failedPRs.length} failed PR(s) to fix:\n`);
  
  failedPRs.forEach(pr => {
    const issues = [];
    if (isConflicting(pr)) issues.push('CONFLICTS');
    if (hasFailures(pr)) issues.push('CI_FAILURES');
    console.log(`  - PR #${pr.number}: ${pr.title} [${issues.join(', ')}]`);
  });
  
  if (failedPRs.length === 0) {
    console.log('✅ No failed PRs found!');
    return;
  }
  
  console.log('\n');
  
  // Ensure we start from a clean state (main/master branch)
  try {
    await execAsync('git fetch origin');
    await execAsync('git checkout main || git checkout master');
    await execAsync('git reset --hard origin/main || git reset --hard origin/master');
  } catch (e) {
    console.warn('Warning: Could not reset to clean state:', e.message);
  }
  
  // Process each failed PR
  for (const pr of failedPRs) {
    try {
      // Ensure clean state before each PR
      try {
        await execAsync('git merge --abort 2>/dev/null || true');
        await execAsync('git reset --hard HEAD 2>/dev/null || true');
        await execAsync('git clean -fd 2>/dev/null || true');
        await execAsync('git checkout main || git checkout master');
      } catch (e) {
        // Ignore cleanup errors
      }
      
      await fixAndMergePR(pr);
      // Add delay between PRs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e) {
      console.error(`❌ Error processing PR #${pr.number}:`, e.message);
      // Clean up after error
      try {
        await execAsync('git merge --abort 2>/dev/null || true');
        await execAsync('git reset --hard HEAD 2>/dev/null || true');
        await execAsync('git checkout main || git checkout master');
      } catch (cleanupError) {
        // Ignore
      }
    }
  }
  
  console.log('\n✅ Finished processing all failed PRs!');
}

main().catch(console.error);
