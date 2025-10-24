#!/usr/bin/env node

/**
 * Review Orchestrator Agent
 * Combines all agent reports into a comprehensive review summary
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function loadReports(reportsDir) {
  const reports = {};
  const reportFiles = [
    'security-report.json',
    'quality-report.json',
    'test-report.json',
    'performance-report.json',
    'docs-report.json',
    'architecture-report.json',
  ];

  for (const reportFile of reportFiles) {
    const reportPaths = [
      path.join(reportsDir, path.basename(reportFile, '.json'), reportFile),
      path.join(reportsDir, reportFile),
    ];

    for (const reportPath of reportPaths) {
      try {
        if (fs.existsSync(reportPath)) {
          const agentName = path.basename(reportFile, '.json').replace('-report', '');
          reports[agentName] = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
          console.log(`✅ Loaded ${agentName} report`);
          break;
        }
      } catch (e) {
        console.warn(`⚠️ Could not load ${reportFile}:`, e.message);
      }
    }
  }

  return reports;
}

async function orchestrateReview(prNumber, reportsDir) {
  console.log(`🎯 Orchestrator combining all agent reviews for PR #${prNumber}...`);

  const reports = loadReports(reportsDir);

  if (Object.keys(reports).length === 0) {
    console.error('❌ No reports found to orchestrate');
    process.exit(1);
  }

  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,additions,deletions,files`, {
      encoding: 'utf-8',
    })
  );

  const reportsText = JSON.stringify(reports, null, 2);

  const prompt = `You are the lead reviewer orchestrating a comprehensive code review.

PR #${prNumber}: ${prDetails.title}
Author: ${prDetails.author.login}
Changes: +${prDetails.additions} -${prDetails.deletions}
Files: ${prDetails.files.length}

Individual Agent Reports:
${reportsText.slice(0, 40000)}

Your task is to synthesize these reports into a comprehensive, actionable review.

Create a final review that:
1. Provides an executive summary
2. Highlights the most critical issues across all agents
3. Identifies patterns and themes
4. Prioritizes action items
5. Gives a clear recommendation
6. Balances thoroughness with readability

Generate a JSON summary and a markdown report:

JSON Format:
{
  "overall_verdict": "approve" | "request_changes" | "comment",
  "confidence": "high" | "medium" | "low",
  "priority_issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "agent": "which agent found it",
      "category": "category",
      "title": "issue title",
      "description": "consolidated description",
      "action_required": "what needs to be done"
    }
  ],
  "summary": {
    "strengths": ["key strengths"],
    "concerns": ["key concerns"],
    "risk_assessment": "overall risk level"
  },
  "agent_summaries": {
    "security": "security status",
    "quality": "quality status",
    "testing": "testing status",
    "performance": "performance status",
    "documentation": "docs status",
    "architecture": "architecture status"
  },
  "recommendations": ["actionable recommendations"],
  "auto_merge_eligible": true/false,
  "requires_discussion": true/false
}

After the JSON, provide a detailed MARKDOWN report for posting as a PR comment.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;

  // Extract JSON
  const jsonMatch = responseText.match(/\{[\s\S]*?\n\}/);
  const summary = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' };

  // Extract Markdown (everything after the JSON)
  const markdownStart = responseText.indexOf('# ');
  const markdown = markdownStart !== -1 ? responseText.slice(markdownStart) : responseText;

  // Save summary
  fs.writeFileSync('orchestrator-summary.json', JSON.stringify(summary, null, 2));

  // Create comprehensive markdown report
  const finalReport = `# 🤖 Multi-Agent Code Review - PR #${prNumber}

${markdown}

---

## 📊 Agent Review Summary

| Agent | Status | Key Findings |
|-------|--------|--------------|
| 🔒 Security | ${summary.agent_summaries?.security || 'Completed'} | ${reports.security?.analysis?.vulnerabilities?.length || 0} vulnerabilities |
| ✨ Code Quality | ${summary.agent_summaries?.quality || 'Completed'} | ${reports.quality?.analysis?.issues?.length || 0} issues |
| 🧪 Testing | ${summary.agent_summaries?.testing || 'Completed'} | ${reports.test?.analysis?.gaps?.length || 0} gaps |
| ⚡ Performance | ${summary.agent_summaries?.performance || 'Completed'} | ${reports.performance?.analysis?.issues?.length || 0} issues |
| 📚 Documentation | ${summary.agent_summaries?.documentation || 'Completed'} | ${reports.docs?.analysis?.gaps?.length || 0} gaps |
| 🏗️ Architecture | ${summary.agent_summaries?.architecture || 'Completed'} | ${reports.architecture?.analysis?.concerns?.length || 0} concerns |

## 🎯 Final Verdict: **${summary.overall_verdict?.toUpperCase() || 'REVIEW'}**

${summary.auto_merge_eligible ? '✅ This PR is eligible for auto-merge' : '⚠️ Manual review required'}

---

<details>
<summary>🔍 View Detailed Agent Reports</summary>

${Object.entries(reports).map(([agent, report]) => `
### ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent
\`\`\`json
${JSON.stringify(report.analysis, null, 2).slice(0, 1000)}
\`\`\`
`).join('\n')}

</details>

---

*Review generated by Multi-Agent Code Review System*
*Powered by Claude AI | ${new Date().toISOString()}*
`;

  fs.writeFileSync('final-review-summary.md', finalReport);

  console.log(`✅ Orchestration complete.`);
  console.log(`   Overall Verdict: ${summary.overall_verdict || 'unknown'}`);
  console.log(`   Priority Issues: ${summary.priority_issues?.length || 0}`);

  return { summary, markdown: finalReport };
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const reportsDirArg = args.find(arg => arg.startsWith('--reports-dir='));

const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;
const reportsDir = reportsDirArg ? reportsDirArg.split('=')[1] : 'reports';

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

orchestrateReview(prNumber, reportsDir)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Orchestrator error:', error);
    process.exit(1);
  });
