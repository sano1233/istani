#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const IntegrationManager = require('./integrations');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

async function analyzePR(prNumber) {
  try {
    const { stdout } = await execAsync(`gh pr view ${prNumber} --json title,body,files,mergeable,state,headRefName,baseRefName,user,number`);
    return JSON.parse(stdout);
  } catch (e) {
    console.error(`Error analyzing PR: ${e.message}`);
    throw e;
  }
}

async function runAI(prompt, tool) {
  try {
    const helperPath = path.join(__dirname, `${tool}-helper.js`);
    const { stdout } = await execAsync(`node "${helperPath}" "${prompt.replace(/"/g, '\\"')}"`, {
      cwd: projectRoot,
      timeout: 30000
    });
    return stdout.trim();
  } catch (e) {
    return `${tool} error: ${e.message}`;
  }
}

async function autoResolveConflicts(prNumber) {
  try {
    console.log(`🔀 Attempting to resolve conflicts for PR #${prNumber}...`);
    
    // Checkout PR branch
    await execAsync(`gh pr checkout ${prNumber}`, { cwd: projectRoot });
    
    // Use enhanced auto-fix system
    try {
      await execAsync('node ai-brain/enhanced-auto-fix.js conflicts', { cwd: projectRoot });
    } catch (e) {
      console.log('Enhanced auto-fix not available, using basic resolution...');
    }
    
    // Check for remaining conflicts
    const { stdout: conflictFiles } = await execAsync('git diff --name-only --diff-filter=U', { cwd: projectRoot });
    const conflicts = conflictFiles.trim().split('\n').filter(Boolean);
    
    if (conflicts.length > 0) {
      console.log(`⚠️  ${conflicts.length} conflict(s) still remain, attempting AI resolution...`);
      
      for (const file of conflicts) {
        try {
          const { stdout: content } = await execAsync(`cat "${file}"`, { cwd: projectRoot });
          const prompt = `Resolve merge conflict in ${file}. Return only the resolved code without conflict markers:\n${content}`;
          const resolved = await runAI(prompt, 'gemini');
          
          if (resolved && !resolved.includes('error')) {
            const fs = require('fs');
            fs.writeFileSync(path.join(projectRoot, file), resolved, 'utf8');
            await execAsync(`git add "${file}"`, { cwd: projectRoot });
            console.log(`✅ Resolved conflicts in ${file}`);
          }
        } catch (e) {
          console.log(`⚠️  Could not resolve ${file}: ${e.message}`);
        }
      }
    }
    
    // Commit if there are staged changes
    try {
      const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectRoot });
      if (status.trim()) {
        await execAsync('git commit -m "🤖 Auto-resolve conflicts via AI Brain"', { cwd: projectRoot });
        await execAsync('git push', { cwd: projectRoot });
        console.log('✅ Conflicts resolved and pushed');
        return true;
      }
    } catch (e) {
      console.log(`⚠️  Could not commit: ${e.message}`);
    }
    
    return conflicts.length === 0;
  } catch (e) {
    console.error(`Error resolving conflicts: ${e.message}`);
    return false;
  }
}

async function runAutoFix() {
  try {
    console.log('🔧 Running auto-fix system...');
    await execAsync('node ai-brain/enhanced-auto-fix.js fix', { cwd: projectRoot });
    
    // Check for changes
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: projectRoot });
    if (status.trim()) {
      await execAsync('git add -A', { cwd: projectRoot });
      await execAsync('git commit -m "🤖 Auto-fix: Resolved code issues [skip ci]"', { cwd: projectRoot });
      await execAsync('git push', { cwd: projectRoot });
      console.log('✅ Auto-fixes applied and pushed');
      return true;
    }
    return false;
  } catch (e) {
    console.log(`⚠️  Auto-fix error: ${e.message}`);
    return false;
  }
}

async function handlePR(prNumber) {
  try {
    console.log(`\n🤖 Processing PR #${prNumber}...`);
    console.log('='.repeat(50));
    
    const prData = await analyzePR(prNumber);
    
    if (prData.state !== 'OPEN') {
      console.log(`PR #${prNumber} is ${prData.state}, skipping...`);
      return;
    }
    
    console.log(`PR: ${prData.title}`);
    console.log(`Files changed: ${prData.files?.length || 0}`);
    console.log(`Mergeable: ${prData.mergeable}`);
    
    // Auto-resolve conflicts if present
    if (prData.mergeable === false || prData.mergeable === 'CONFLICTING') {
      const resolved = await autoResolveConflicts(prNumber);
      if (!resolved) {
        console.log('⚠️  Could not auto-resolve all conflicts');
        return;
      }
      // Re-analyze PR after conflict resolution
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedPR = await analyzePR(prNumber);
      prData.mergeable = updatedPR.mergeable;
    }
    
    // Run auto-fix
    await runAutoFix();
    
    // AI Review (if helpers are available)
    try {
      const prompt = `Review PR: ${prData.title}. Files: ${prData.files?.map(f => f.path).join(', ') || 'N/A'}. Approve if safe and follows best practices.`;
      const [gemini, claude, qwen] = await Promise.all([
        runAI(prompt, 'gemini').catch(() => 'Not available'),
        runAI(prompt, 'claude').catch(() => 'Not available'),
        runAI(prompt, 'qwen').catch(() => 'Not available')
      ]);
      
      const comment = `## 🤖 AI Brain Analysis\n\n### GEMINI\n${gemini}\n\n### CLAUDE\n${claude}\n\n### QWEN\n${qwen}`;
      await execAsync(`gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"')}"`);
      
      const approvals = [gemini, claude, qwen].filter(r => 
        r && r.toLowerCase().includes('approve') && !r.toLowerCase().includes('error')
      ).length;
      
      if (approvals >= 2 && prData.mergeable) {
        console.log('✅ PR approved by AI, attempting auto-merge...');
        try {
          await execAsync(`gh pr review ${prNumber} --approve`);
          await execAsync(`gh pr merge ${prNumber} --auto --squash`);
          console.log('✅ PR auto-merged');
          
          // Notify integrations
          const integrations = new IntegrationManager();
          await integrations.handlePRMerged(prData);
        } catch (e) {
          console.log(`⚠️  Could not auto-merge: ${e.message}`);
        }
      }
    } catch (e) {
      console.log(`⚠️  AI review skipped: ${e.message}`);
    }
    
    console.log(`\n✅ PR #${prNumber} processing complete`);
  } catch (error) {
    console.error(`❌ Error handling PR: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const prNumber = process.argv[2];
  if (!prNumber) {
    console.error('Usage: node ai-brain/pr-handler.js <pr-number>');
    process.exit(1);
  }
  
  handlePR(prNumber).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { handlePR, analyzePR, autoResolveConflicts };
