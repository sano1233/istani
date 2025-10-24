#!/usr/bin/env node

/**
 * Test Automation Agent
 * Analyzes test coverage and suggests test improvements
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeTests(prNumber) {
  console.log(`🧪 Test Agent analyzing PR #${prNumber}...`);

  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  let testResults = 'No test results available';
  try {
    if (fs.existsSync('test-results.json')) {
      testResults = fs.readFileSync('test-results.json', 'utf-8');
    }
  } catch (e) {
    console.warn('Warning: Could not load test results');
  }

  const prompt = `You are a testing expert reviewing code changes and test coverage.

PR Title: ${prDetails.title}
Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

Test Results:
${testResults}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Analyze testing completeness focusing on:

1. **Test Coverage**
   - Unit test coverage for new code
   - Integration tests needed
   - Edge cases covered
   - Error scenarios tested

2. **Test Quality**
   - Test clarity and readability
   - Proper assertions
   - Test isolation
   - Mock/stub usage

3. **Test Organization**
   - Test structure
   - Setup/teardown
   - Test naming
   - Test grouping

4. **Missing Tests**
   - Untested functionality
   - Missing edge cases
   - Error conditions not tested
   - Integration gaps

5. **Test Maintainability**
   - Test duplication
   - Test complexity
   - Test data management
   - Test documentation

Provide analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "comment",
  "coverage_assessment": "coverage evaluation",
  "summary": "test analysis summary",
  "test_stats": {
    "total_tests": 0,
    "passing": 0,
    "failing": 0,
    "coverage_percent": 0
  },
  "strengths": ["good testing practices found"],
  "gaps": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "type": "unit" | "integration" | "e2e",
      "description": "what's missing",
      "location": "code area affected",
      "suggestion": "test to add",
      "example": "test code example"
    }
  ],
  "improvements": ["suggested test improvements"],
  "risk_areas": ["untested risky code areas"]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' };

  const report = {
    timestamp: new Date().toISOString(),
    pr_number: prNumber,
    agent: 'test-agent',
    analysis,
  };

  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Test analysis complete.`);
  console.log(`   Test gaps found: ${analysis.gaps?.length || 0}`);

  return report;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

analyzeTests(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test agent error:', error);
    process.exit(1);
  });
