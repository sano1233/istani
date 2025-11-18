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

async function detectCodeErrors(prNumber) {
  const errors = {
    syntax: [],
    lint: [],
    html: [],
    css: []
  };

  try {
    await execAsync(`gh pr checkout ${prNumber}`);

    // Check JavaScript syntax errors
    try {
      const { stdout: jsFiles } = await execAsync('find . -name "*.js" -not -path "*/node_modules/*"');
      const files = jsFiles.trim().split('\n').filter(Boolean);

      for (const file of files) {
        try {
          await execAsync(`node --check "${file}"`);
        } catch (e) {
          errors.syntax.push({ file, error: e.stderr || e.message });
        }
      }
    } catch (e) {
      // No JS files or find error
    }

    // Check HTML validation
    try {
      const { stdout: htmlFiles } = await execAsync('find . -name "*.html" -not -path "*/node_modules/*"');
      const files = htmlFiles.trim().split('\n').filter(Boolean);

      for (const file of files) {
        try {
          const { stdout: content } = await execAsync(`cat "${file}"`);
          // Basic HTML validation checks
          if (!content.includes('<!DOCTYPE') && !content.includes('<!doctype')) {
            errors.html.push({ file, error: 'Missing DOCTYPE declaration' });
          }
          const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
          const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
          if (Math.abs(openTags - closeTags) > 5) {
            errors.html.push({ file, error: 'Potential unclosed tags detected' });
          }
        } catch (e) {
          errors.html.push({ file, error: e.message });
        }
      }
    } catch (e) {
      // No HTML files
    }

    // Check CSS syntax
    try {
      const { stdout: cssFiles } = await execAsync('find . -name "*.css" -not -path "*/node_modules/*"');
      const files = cssFiles.trim().split('\n').filter(Boolean);

      for (const file of files) {
        try {
          const { stdout: content } = await execAsync(`cat "${file}"`);
          // Basic CSS validation
          const openBraces = (content.match(/\{/g) || []).length;
          const closeBraces = (content.match(/\}/g) || []).length;
          if (openBraces !== closeBraces) {
            errors.css.push({ file, error: `Mismatched braces: ${openBraces} open, ${closeBraces} close` });
          }
        } catch (e) {
          errors.css.push({ file, error: e.message });
        }
      }
    } catch (e) {
      // No CSS files
    }

  } catch (e) {
    console.error('Error detecting code errors:', e.message);
  }

  return errors;
}

async function fixCodeErrors(errors) {
  const fixes = [];

  // Fix syntax errors
  for (const { file, error } of errors.syntax) {
    try {
      const { stdout: content } = await execAsync(`cat "${file}"`);
      const prompt = `Fix JavaScript syntax error in ${file}:\n\nError: ${error}\n\nCode:\n${content}\n\nReturn ONLY the fixed code, no explanations.`;
      const fixed = await runAI(prompt, 'claude');

      if (fixed && !fixed.includes('error:')) {
        await execAsync(`cat > "${file}" << 'EOFFIX'
${fixed}
EOFFIX`);
        await execAsync(`git add "${file}"`);
        fixes.push({ file, type: 'syntax', status: 'fixed' });
      }
    } catch (e) {
      fixes.push({ file, type: 'syntax', status: 'failed', error: e.message });
    }
  }

  // Fix HTML errors
  for (const { file, error } of errors.html) {
    try {
      const { stdout: content } = await execAsync(`cat "${file}"`);
      const prompt = `Fix HTML error in ${file}:\n\nError: ${error}\n\nCode:\n${content}\n\nReturn ONLY the fixed HTML code, no explanations.`;
      const fixed = await runAI(prompt, 'gemini');

      if (fixed && !fixed.includes('error:')) {
        await execAsync(`cat > "${file}" << 'EOFFIX'
${fixed}
EOFFIX`);
        await execAsync(`git add "${file}"`);
        fixes.push({ file, type: 'html', status: 'fixed' });
      }
    } catch (e) {
      fixes.push({ file, type: 'html', status: 'failed', error: e.message });
    }
  }

  // Fix CSS errors
  for (const { file, error } of errors.css) {
    try {
      const { stdout: content } = await execAsync(`cat "${file}"`);
      const prompt = `Fix CSS error in ${file}:\n\nError: ${error}\n\nCode:\n${content}\n\nReturn ONLY the fixed CSS code, no explanations.`;
      const fixed = await runAI(prompt, 'qwen');

      if (fixed && !fixed.includes('error:')) {
        await execAsync(`cat > "${file}" << 'EOFFIX'
${fixed}
EOFFIX`);
        await execAsync(`git add "${file}"`);
        fixes.push({ file, type: 'css', status: 'fixed' });
      }
    } catch (e) {
      fixes.push({ file, type: 'css', status: 'failed', error: e.message });
    }
  }

  return fixes;
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
  let errorReport = '';
  let fixReport = '';
  let fixes = [];

  // Step 1: Resolve merge conflicts
  if (prData.mergeable === 'CONFLICTING') {
    const conflictResolved = await autoResolveConflicts(prNumber);
    errorReport += conflictResolved ? '✅ Merge conflicts auto-resolved\n' : '❌ Failed to resolve conflicts\n';
  }

  // Step 2: Detect code errors
  console.log('Detecting code errors...');
  const errors = await detectCodeErrors(prNumber);
  const totalErrors = errors.syntax.length + errors.html.length + errors.css.length;

  if (totalErrors > 0) {
    errorReport += `\n### 🔍 Code Errors Detected (${totalErrors})\n`;
    if (errors.syntax.length > 0) {
      errorReport += `- JavaScript: ${errors.syntax.length} error(s)\n`;
      errors.syntax.forEach(e => errorReport += `  - ${e.file}: ${e.error}\n`);
    }
    if (errors.html.length > 0) {
      errorReport += `- HTML: ${errors.html.length} error(s)\n`;
      errors.html.forEach(e => errorReport += `  - ${e.file}: ${e.error}\n`);
    }
    if (errors.css.length > 0) {
      errorReport += `- CSS: ${errors.css.length} error(s)\n`;
      errors.css.forEach(e => errorReport += `  - ${e.file}: ${e.error}\n`);
    }

    // Step 3: Auto-fix errors
    console.log('Attempting to fix code errors...');
    fixes = await fixCodeErrors(errors);
    const fixedCount = fixes.filter(f => f.status === 'fixed').length;

    if (fixedCount > 0) {
      fixReport += `\n### 🔧 Auto-Fixed Errors (${fixedCount}/${totalErrors})\n`;
      fixes.forEach(fix => {
        const emoji = fix.status === 'fixed' ? '✅' : '❌';
        fixReport += `${emoji} ${fix.type}: ${fix.file}\n`;
      });

      // Commit fixes
      try {
        await execAsync('git commit -m "AI Brain: Auto-fix code errors" || echo "No changes to commit"');
        await execAsync('git push');
        fixReport += '\n✅ Fixes committed and pushed\n';
      } catch (e) {
        fixReport += `\n❌ Failed to push fixes: ${e.message}\n`;
      }
    }
  } else {
    errorReport += '\n✅ No code errors detected\n';
  }

  // Step 4: AI Review
  const prompt = `Review PR: ${prData.title}. Files: ${prData.files.map(f => f.path).join(', ')}. Code quality check. Approve if safe.`;
  const [gemini, claude, qwen] = await Promise.all([
    runAI(prompt, 'gemini'),
    runAI(prompt, 'claude'),
    runAI(prompt, 'qwen')
  ]);

  // Step 5: Post comprehensive report
  const comment = `## 🤖 AI Brain Analysis\n${errorReport}${fixReport}\n### AI Review Panel\n\n**GEMINI**\n${gemini}\n\n**CLAUDE**\n${claude}\n\n**QWEN**\n${qwen}`;
  await execAsync(`gh pr comment ${prNumber} --body "${comment.replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`);

  // Step 6: Auto-approve and merge if conditions met
  const approvals = [gemini, claude, qwen].filter(r => r.toLowerCase().includes('approve')).length;
  const noFailedFixes = fixes.length === 0 || fixes.filter(f => f.status === 'failed').length === 0;

  if (approvals >= 2 && noFailedFixes) {
    console.log(`PR approved by ${approvals}/3 AI models. Auto-merging...`);
    await execAsync(`gh pr review ${prNumber} --approve`);
    await execAsync(`gh pr merge ${prNumber} --auto --squash`);
  } else {
    console.log(`Not merging: ${approvals} approvals, failed fixes: ${!noFailedFixes}`);
  }
}

handlePR(process.argv[2]).catch(console.error);
