const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function analyzePR(prNumber) {
  const { stdout } = await execAsync(`gh pr view ${prNumber} --json title,body,files,mergeable`);
  return JSON.parse(stdout);
}

async function runAI(prompt, tool) {
  try {
    const { stdout } = await execAsync(`node ai-brain/${tool}-helper.js "${prompt.replace(/"/g, '\\"')}"`);
    return stdout.trim();
  } catch (e) {
    return `${tool} error: ${e.message}`;
  }
}

async function autoResolveConflicts(prNumber) {
  try {
    await execAsync(`gh pr checkout ${prNumber}`);
    const { stdout } = await execAsync('git diff --name-only --diff-filter=U');
    const conflicts = stdout.trim().split('\n').filter(Boolean);
    
    for (const file of conflicts) {
      const { stdout: content } = await execAsync(`cat ${file}`);
      const prompt = `Resolve merge conflict in ${file}. Return only the resolved code:\n${content}`;
      const resolved = await runAI(prompt, 'gemini');
      await execAsync(`echo "${resolved}" > ${file}`);
      await execAsync(`git add ${file}`);
    }
    
    await execAsync('git commit -m "Auto-resolve conflicts via AI Brain"');
    await execAsync('git push');
    return true;
  } catch (e) {
    return false;
  }
}

async function handlePR(prNumber) {
  const prData = await analyzePR(prNumber);
  
  if (prData.mergeable === 'CONFLICTING') {
    await autoResolveConflicts(prNumber);
  }
  
  const prompt = `Review PR: ${prData.title}. Files: ${prData.files.map(f => f.path).join(', ')}. Approve if safe.`;
  const [gemini, claude, qwen] = await Promise.all([
    runAI(prompt, 'gemini'),
    runAI(prompt, 'claude'),
    runAI(prompt, 'qwen')
  ]);
  
  const comment = `## AI Brain Analysis\n\n### GEMINI\n${gemini}\n\n### CLAUDE\n${claude}\n\n### QWEN\n${qwen}`;
  await execAsync(`gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"')}"`);
  
  const approvals = [gemini, claude, qwen].filter(r => r.toLowerCase().includes('approve')).length;
  if (approvals >= 2) {
    await execAsync(`gh pr review ${prNumber} --approve`);
    await execAsync(`gh pr merge ${prNumber} --auto --squash`);
  }
}

handlePR(process.argv[2]).catch(console.error);
