const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

// Validate PR number is a positive integer
function validatePRNumber(prNumber) {
  const num = parseInt(prNumber, 10);
  if (isNaN(num) || num <= 0) {
    throw new Error(`Invalid PR number: ${prNumber}`);
  }
  return num;
}

async function analyzePR(prNumber) {
  try {
    const validPR = validatePRNumber(prNumber);
    const { stdout } = await execAsync(`gh pr view ${validPR} --json title,body,files,mergeable`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Failed to analyze PR ${prNumber}:`, error.message);
    throw error;
  }
}

async function runAI(prompt, tool) {
  const validTools = ['gemini', 'claude', 'qwen'];
  if (!validTools.includes(tool)) {
    return `${tool} error: Invalid tool specified`;
  }

  try {
    // Use stdin instead of command line arguments to avoid injection
    const helperPath = path.join(__dirname, `${tool}-helper.js`);
    const { stdout, stderr } = await execAsync(`node "${helperPath}"`, {
      input: prompt,
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    if (stderr) {
      console.warn(`${tool} stderr:`, stderr);
    }

    return stdout.trim();
  } catch (e) {
    console.error(`${tool} error:`, e.message);
    return `${tool} error: ${e.message}`;
  }
}

async function autoResolveConflicts(prNumber) {
  try {
    const validPR = validatePRNumber(prNumber);
    await execAsync(`gh pr checkout ${validPR}`);
    const { stdout } = await execAsync('git diff --name-only --diff-filter=U');
    const conflicts = stdout.trim().split('\n').filter(Boolean);

    if (conflicts.length === 0) {
      console.log('No conflicts found');
      return true;
    }

    console.log(`Found ${conflicts.length} conflicts to resolve`);

    for (const file of conflicts) {
      try {
        // Use fs.readFile instead of cat for security
        const content = await fs.readFile(file, 'utf-8');
        const prompt = `Resolve merge conflict in ${file}. Return only the resolved code:\n${content}`;
        const resolved = await runAI(prompt, 'gemini');

        // Write using fs instead of echo for safety
        await fs.writeFile(file, resolved, 'utf-8');
        await execAsync(`git add "${file}"`);
        console.log(`Resolved conflict in ${file}`);
      } catch (fileError) {
        console.error(`Failed to resolve conflict in ${file}:`, fileError.message);
        throw fileError;
      }
    }

    await execAsync('git commit -m "Auto-resolve conflicts via AI Brain"');
    await execAsync('git push');
    console.log('Successfully resolved and pushed conflicts');
    return true;
  } catch (e) {
    console.error('Auto-resolve conflicts failed:', e.message);
    return false;
  }
}

async function handlePR(prNumber) {
  try {
    console.log(`\n=== Processing PR #${prNumber} ===\n`);

    const prData = await analyzePR(prNumber);
    console.log(`PR Title: ${prData.title}`);
    console.log(`Mergeable: ${prData.mergeable}`);

    if (prData.mergeable === 'CONFLICTING') {
      console.log('\nAttempting to auto-resolve conflicts...');
      const resolved = await autoResolveConflicts(prNumber);
      if (!resolved) {
        console.error('Failed to auto-resolve conflicts');
        return;
      }
    }

    const files = (prData.files || []).map(f => f.path).join(', ');
    const prompt = `Review PR: ${prData.title}. Files: ${files}. Approve if safe.`;

    console.log('\nRunning AI analysis...');
    const [gemini, claude, qwen] = await Promise.all([
      runAI(prompt, 'gemini'),
      runAI(prompt, 'claude'),
      runAI(prompt, 'qwen')
    ]);

    const comment = `## AI Brain Analysis\n\n### GEMINI\n${gemini}\n\n### CLAUDE\n${claude}\n\n### QWEN\n${qwen}`;

    // Write comment to temp file to avoid command injection
    const tempFile = path.join(__dirname, '.temp-comment.txt');
    await fs.writeFile(tempFile, comment, 'utf-8');

    try {
      const validPR = validatePRNumber(prNumber);
      await execAsync(`gh pr comment ${validPR} --body-file "${tempFile}"`);
      console.log('\nPosted AI analysis comment');
    } finally {
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
    }

    const approvals = [gemini, claude, qwen].filter(
      r => r && r.toLowerCase().includes('approve')
    ).length;

    console.log(`\nApprovals: ${approvals}/3`);

    if (approvals >= 2) {
      console.log('Auto-approving and merging PR...');
      const validPR = validatePRNumber(prNumber);
      await execAsync(`gh pr review ${validPR} --approve`);
      await execAsync(`gh pr merge ${validPR} --auto --squash`);
      console.log('PR approved and set to auto-merge');
    } else {
      console.log('Not enough approvals for auto-merge');
    }

    console.log('\n=== PR Processing Complete ===\n');
  } catch (error) {
    console.error('\n=== PR Processing Failed ===');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Main execution
const prNumber = process.argv[2];
if (!prNumber) {
  console.error('Usage: node pr-handler.js <PR_NUMBER>');
  process.exit(1);
}

handlePR(prNumber).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
