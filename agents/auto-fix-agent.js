#!/usr/bin/env node

/**
 * Auto-Fix Agent
 * Automatically fixes common issues found by other agents
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
          break;
        }
      } catch (e) {
        console.warn(`⚠️ Could not load ${reportFile}`);
      }
    }
  }

  return reports;
}

async function generateFixes(prNumber, reportsDir) {
  console.log(`🔧 Auto-Fix Agent analyzing issues for PR #${prNumber}...`);

  const reports = loadReports(reportsDir);

  if (Object.keys(reports).length === 0) {
    console.log('ℹ️ No reports found, skipping auto-fix');
    return;
  }

  // Extract fixable issues
  const fixableIssues = [];

  for (const [agent, report] of Object.entries(reports)) {
    const issues = report.analysis?.issues || report.analysis?.vulnerabilities || report.analysis?.gaps || [];

    for (const issue of issues) {
      if (
        issue.severity !== 'critical' &&
        (issue.suggestion || issue.recommendation || issue.optimization || issue.example)
      ) {
        fixableIssues.push({
          agent,
          ...issue,
        });
      }
    }
  }

  if (fixableIssues.length === 0) {
    console.log('✅ No automatically fixable issues found');
    return;
  }

  console.log(`📝 Found ${fixableIssues.length} potentially fixable issues`);

  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json files`, {
      encoding: 'utf-8',
    })
  );

  // Get current code for affected files
  const fileContents = {};
  for (const file of prDetails.files.slice(0, 10)) {
    try {
      fileContents[file.path] = fs.readFileSync(file.path, 'utf-8');
    } catch (e) {
      console.warn(`⚠️ Could not read ${file.path}`);
    }
  }

  const prompt = `You are an automated code fixer. Apply fixes for the following issues:

Issues to Fix:
${JSON.stringify(fixableIssues, null, 2).slice(0, 20000)}

Current File Contents:
${Object.entries(fileContents)
  .map(([path, content]) => `
=== ${path} ===
${content.slice(0, 5000)}
`)
  .join('\n')}

Generate fixes for as many issues as possible. For each fix, provide:
1. The exact file path
2. The specific changes to make
3. The reason for the change

IMPORTANT: Only suggest fixes that are:
- Safe and will not break functionality
- Follow the existing code style
- Address the issues identified
- Do not require additional dependencies

Respond in JSON format:
{
  "fixes": [
    {
      "file": "path/to/file.js",
      "location": "line number or function name",
      "issue": "brief issue description",
      "change_type": "add" | "modify" | "remove",
      "original_code": "code to replace (if modifying)",
      "fixed_code": "corrected code",
      "reason": "why this fix is safe and correct"
    }
  ],
  "skipped": [
    {
      "issue": "issue description",
      "reason": "why we can't auto-fix this"
    }
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const fixes = jsonMatch ? JSON.parse(jsonMatch[0]) : { fixes: [], skipped: [] };

  // Apply fixes
  let appliedCount = 0;
  for (const fix of fixes.fixes || []) {
    try {
      if (fs.existsSync(fix.file)) {
        let content = fs.readFileSync(fix.file, 'utf-8');

        if (fix.change_type === 'modify' && fix.original_code && fix.fixed_code) {
          if (content.includes(fix.original_code)) {
            content = content.replace(fix.original_code, fix.fixed_code);
            fs.writeFileSync(fix.file, content);
            appliedCount++;
            console.log(`✅ Fixed: ${fix.file} - ${fix.issue}`);
          } else {
            console.log(`⚠️ Could not find original code in ${fix.file}`);
          }
        }
      }
    } catch (e) {
      console.error(`❌ Failed to apply fix to ${fix.file}:`, e.message);
    }
  }

  console.log(`\n🔧 Auto-Fix Summary:`);
  console.log(`   Applied: ${appliedCount} fixes`);
  console.log(`   Skipped: ${fixes.skipped?.length || 0} issues`);

  // Save fix report
  fs.writeFileSync('auto-fix-report.json', JSON.stringify({ ...fixes, appliedCount }, null, 2));

  return fixes;
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

generateFixes(prNumber, reportsDir)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Auto-fix agent error:', error);
    process.exit(1);
  });
