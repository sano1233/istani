#!/usr/bin/env node

/**
 * Merge Decision Agent
 * Decides whether a PR should be auto-merged based on all reviews
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function decideMerge(prNumber) {
  console.log(`🚀 Merge Decision Agent evaluating PR #${prNumber}...`);

  // Load orchestrator summary
  let summary = {};
  try {
    if (fs.existsSync('orchestrator-summary.json')) {
      summary = JSON.parse(fs.readFileSync('orchestrator-summary.json', 'utf-8'));
    }
  } catch (e) {
    console.error('❌ Could not load orchestrator summary');
    process.exit(1);
  }

  // Get PR details
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,mergeable,reviews,reviewDecision`, {
      encoding: 'utf-8',
    })
  );

  // Get CI status
  let ciStatus = 'unknown';
  try {
    const checks = execSync(`gh pr checks ${prNumber} --json state`, { encoding: 'utf-8' });
    const checksData = JSON.parse(checks);
    ciStatus = checksData.every(c => c.state === 'SUCCESS') ? 'passing' : 'failing';
  } catch (e) {
    console.warn('⚠️ Could not get CI status');
  }

  const prompt = `You are making a merge decision for a pull request based on comprehensive agent reviews.

PR #${prNumber}: ${prDetails.title}
Author: ${prDetails.author.login}
Mergeable: ${prDetails.mergeable}
CI Status: ${ciStatus}
Review Decision: ${prDetails.reviewDecision || 'NONE'}

Agent Review Summary:
${JSON.stringify(summary, null, 2)}

Decide whether this PR should be auto-merged based on:

1. **Review Verdict**: All agents should approve or have minor comments only
2. **Critical Issues**: No critical or high-severity issues
3. **CI Status**: All checks passing
4. **Mergeable**: No merge conflicts
5. **Risk Level**: Low to medium risk only
6. **Test Coverage**: Adequate test coverage
7. **Security**: No security vulnerabilities

Auto-merge criteria (ALL must be true):
- Overall verdict is "approve" or "comment" with no blocking issues
- No critical or high severity issues
- CI is passing
- PR is mergeable
- Risk assessment is low or medium
- No security vulnerabilities of high/critical severity
- No unresolved discussion threads

Respond in JSON format:
{
  "shouldMerge": true/false,
  "confidence": "high" | "medium" | "low",
  "reason": "clear explanation of decision",
  "blocking_issues": ["list of issues preventing merge"],
  "merge_method": "squash" | "merge" | "rebase",
  "commitTitle": "suggested commit title",
  "commitMessage": "suggested commit message with PR summary",
  "conditions_met": {
    "reviews_approved": true/false,
    "no_critical_issues": true/false,
    "ci_passing": true/false,
    "mergeable": true/false,
    "risk_acceptable": true/false,
    "security_clear": true/false
  },
  "human_review_recommended": true/false,
  "human_review_reason": "why human review is recommended if true"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : { shouldMerge: false, reason: 'Failed to parse response' };

  // Save decision
  fs.writeFileSync('merge-decision.json', JSON.stringify(decision, null, 2));

  console.log(`\n🚀 Merge Decision:`);
  console.log(`   Should Merge: ${decision.shouldMerge ? '✅ YES' : '❌ NO'}`);
  console.log(`   Confidence: ${decision.confidence}`);
  console.log(`   Reason: ${decision.reason}`);

  if (decision.blocking_issues && decision.blocking_issues.length > 0) {
    console.log(`\n⚠️ Blocking Issues:`);
    decision.blocking_issues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (decision.human_review_recommended) {
    console.log(`\n👤 Human review recommended: ${decision.human_review_reason}`);
  }

  return decision;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

decideMerge(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Merge decision agent error:', error);
    process.exit(1);
  });
