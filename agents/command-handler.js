#!/usr/bin/env node

/**
 * Command Handler Agent
 * Handles bot commands in PR comments (/agent commands)
 */

const { execSync } = require('child_process');
const fs = require('fs');

const COMMANDS = {
  '/agent review': 'Trigger a full multi-agent review',
  '/agent security': 'Run security agent only',
  '/agent quality': 'Run code quality agent only',
  '/agent test': 'Run test agent only',
  '/agent performance': 'Run performance agent only',
  '/agent docs': 'Run documentation agent only',
  '/agent architecture': 'Run architecture agent only',
  '/agent fix': 'Apply auto-fixes for identified issues',
  '/agent merge': 'Evaluate merge decision',
  '/agent status': 'Show current review status',
  '/agent help': 'Show available commands',
};

async function handleCommand(comment, prNumber) {
  console.log(`🎮 Command Handler processing comment for PR #${prNumber}`);
  console.log(`Comment: ${comment.slice(0, 100)}...`);

  const command = Object.keys(COMMANDS).find(cmd => comment.includes(cmd));

  if (!command) {
    console.log('ℹ️ No recognized command found in comment');
    return;
  }

  console.log(`✅ Recognized command: ${command}`);

  let response = '';

  try {
    switch (command) {
      case '/agent review':
        response = await triggerFullReview(prNumber);
        break;

      case '/agent security':
        response = await runSingleAgent('security', prNumber);
        break;

      case '/agent quality':
        response = await runSingleAgent('code-quality', prNumber);
        break;

      case '/agent test':
        response = await runSingleAgent('test', prNumber);
        break;

      case '/agent performance':
        response = await runSingleAgent('performance', prNumber);
        break;

      case '/agent docs':
        response = await runSingleAgent('documentation', prNumber);
        break;

      case '/agent architecture':
        response = await runSingleAgent('architecture', prNumber);
        break;

      case '/agent fix':
        response = await triggerAutoFix(prNumber);
        break;

      case '/agent merge':
        response = await evaluateMerge(prNumber);
        break;

      case '/agent status':
        response = await getReviewStatus(prNumber);
        break;

      case '/agent help':
        response = getHelpMessage();
        break;

      default:
        response = `Unknown command: ${command}`;
    }

    // Post response as comment
    postComment(prNumber, response);
  } catch (error) {
    console.error('❌ Command execution failed:', error);
    postComment(prNumber, `❌ Command failed: ${error.message}`);
  }
}

async function triggerFullReview(prNumber) {
  console.log('🔄 Triggering full multi-agent review...');

  // This would trigger the workflow again or run agents directly
  execSync(`gh workflow run enhanced-multi-agent-review.yml -f pr_number=${prNumber}`, {
    encoding: 'utf-8',
  });

  return `## 🤖 Multi-Agent Review Triggered

A comprehensive review has been initiated for PR #${prNumber}.

All agents will analyze the code:
- 🔒 Security Agent
- ✨ Code Quality Agent
- 🧪 Test Agent
- ⚡ Performance Agent
- 📚 Documentation Agent
- 🏗️ Architecture Agent

Results will be posted shortly...`;
}

async function runSingleAgent(agentName, prNumber) {
  console.log(`🔄 Running ${agentName} agent...`);

  const agentScript = `agents/${agentName}-agent.js`;
  const output = execSync(`node ${agentScript} --pr=${prNumber}`, {
    encoding: 'utf-8',
  });

  // Load the report
  const reportFile = `${agentName}-report.json`;
  let report = {};
  if (fs.existsSync(reportFile)) {
    report = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
  }

  return `## ${getAgentEmoji(agentName)} ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent Report

${formatAgentReport(report)}

*Run \`/agent review\` for a complete multi-agent analysis*`;
}

async function triggerAutoFix(prNumber) {
  console.log('🔧 Triggering auto-fix...');

  execSync(`node agents/auto-fix-agent.js --pr=${prNumber} --apply-fixes`, {
    encoding: 'utf-8',
  });

  let fixReport = {};
  if (fs.existsSync('auto-fix-report.json')) {
    fixReport = JSON.parse(fs.readFileSync('auto-fix-report.json', 'utf-8'));
  }

  return `## 🔧 Auto-Fix Applied

**Applied Fixes:** ${fixReport.appliedCount || 0}
**Skipped Issues:** ${fixReport.skipped?.length || 0}

${fixReport.appliedCount > 0 ? 'Fixes have been committed to this PR.' : 'No fixes were applied.'}

*Review the changes and run tests to verify*`;
}

async function evaluateMerge(prNumber) {
  console.log('🚀 Evaluating merge decision...');

  execSync(`node agents/merge-decision-agent.js --pr=${prNumber}`, {
    encoding: 'utf-8',
  });

  let decision = {};
  if (fs.existsSync('merge-decision.json')) {
    decision = JSON.parse(fs.readFileSync('merge-decision.json', 'utf-8'));
  }

  return `## 🚀 Merge Decision

**Should Merge:** ${decision.shouldMerge ? '✅ YES' : '❌ NO'}
**Confidence:** ${decision.confidence}

**Reason:** ${decision.reason}

${
  decision.blocking_issues && decision.blocking_issues.length > 0
    ? `\n**Blocking Issues:**\n${decision.blocking_issues.map(i => `- ${i}`).join('\n')}`
    : ''
}

${
  decision.human_review_recommended
    ? `\n⚠️ **Human Review Recommended:** ${decision.human_review_reason}`
    : ''
}`;
}

async function getReviewStatus(prNumber) {
  console.log('📊 Getting review status...');

  let status = '## 📊 Review Status\n\n';

  // Check which reports exist
  const reports = [
    { name: 'Security', file: 'security-report.json', emoji: '🔒' },
    { name: 'Code Quality', file: 'quality-report.json', emoji: '✨' },
    { name: 'Testing', file: 'test-report.json', emoji: '🧪' },
    { name: 'Performance', file: 'performance-report.json', emoji: '⚡' },
    { name: 'Documentation', file: 'docs-report.json', emoji: '📚' },
    { name: 'Architecture', file: 'architecture-report.json', emoji: '🏗️' },
  ];

  status += '| Agent | Status |\n';
  status += '|-------|--------|\n';

  for (const report of reports) {
    const exists = fs.existsSync(report.file);
    status += `| ${report.emoji} ${report.name} | ${exists ? '✅ Complete' : '⏳ Pending'} |\n`;
  }

  const orchestratorExists = fs.existsSync('orchestrator-summary.json');
  status += `\n**Overall Review:** ${orchestratorExists ? '✅ Complete' : '⏳ Pending'}\n`;

  if (orchestratorExists) {
    const summary = JSON.parse(fs.readFileSync('orchestrator-summary.json', 'utf-8'));
    status += `\n**Verdict:** ${summary.overall_verdict}\n`;
    status += `**Priority Issues:** ${summary.priority_issues?.length || 0}\n`;
  }

  return status;
}

function getHelpMessage() {
  let help = '## 🤖 Multi-Agent Code Review Commands\n\n';
  help += '| Command | Description |\n';
  help += '|---------|-------------|\n';

  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    help += `| \`${cmd}\` | ${desc} |\n`;
  }

  help += '\n*Use these commands in PR comments to interact with the review agents*';

  return help;
}

function getAgentEmoji(agentName) {
  const emojis = {
    security: '🔒',
    'code-quality': '✨',
    test: '🧪',
    performance: '⚡',
    documentation: '📚',
    architecture: '🏗️',
  };
  return emojis[agentName] || '🤖';
}

function formatAgentReport(report) {
  if (!report || !report.analysis) {
    return 'No analysis available';
  }

  const analysis = report.analysis;
  let formatted = '';

  if (analysis.summary) {
    formatted += `**Summary:** ${analysis.summary}\n\n`;
  }

  if (analysis.verdict) {
    formatted += `**Verdict:** ${analysis.verdict}\n\n`;
  }

  // Add issues/vulnerabilities/gaps/concerns
  const issues =
    analysis.issues ||
    analysis.vulnerabilities ||
    analysis.gaps ||
    analysis.concerns ||
    [];

  if (issues.length > 0) {
    formatted += `**Issues Found:** ${issues.length}\n\n`;
    issues.slice(0, 5).forEach((issue, i) => {
      formatted += `${i + 1}. **${issue.title || issue.category}** (${issue.severity})\n`;
      formatted += `   ${issue.description}\n\n`;
    });

    if (issues.length > 5) {
      formatted += `*... and ${issues.length - 5} more issues*\n`;
    }
  }

  return formatted;
}

function postComment(prNumber, message) {
  try {
    execSync(`gh pr comment ${prNumber} --body "${message.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
    });
    console.log('✅ Comment posted successfully');
  } catch (error) {
    console.error('❌ Failed to post comment:', error.message);
  }
}

// Main execution
const args = process.argv.slice(2);
const commentArg = args.find(arg => arg.startsWith('--comment='));
const prNumberArg = args.find(arg => arg.startsWith('--pr='));

const comment = commentArg ? commentArg.split('=')[1] : process.env.COMMENT_BODY;
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!comment || !prNumber) {
  console.error('❌ Error: comment and PR number are required');
  process.exit(1);
}

handleCommand(comment, prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Command handler error:', error);
    process.exit(1);
  });
