#!/usr/bin/env node

/**
 * Code Quality Review Agent
 * Analyzes code for quality, maintainability, and best practices
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeCodeQuality(prNumber) {
  console.log(`✨ Code Quality Agent analyzing PR #${prNumber}...`);

  // Get PR diff
  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });

  // Get PR details
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  // Get lint results if available
  let lintResults = '';
  try {
    lintResults = execSync('npm run lint -- --format json', { encoding: 'utf-8' });
  } catch (e) {
    lintResults = 'Lint results not available';
  }

  const prompt = `You are a senior code reviewer analyzing code quality and maintainability.

PR Title: ${prDetails.title}
PR Author: ${prDetails.author.login}
PR Description: ${prDetails.body || 'No description provided'}

Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

ESLint Results:
${lintResults}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Analyze the code quality focusing on:

1. **Code Structure & Design**
   - Single Responsibility Principle
   - DRY (Don't Repeat Yourself)
   - Code organization and modularity
   - Proper abstraction levels

2. **Naming & Readability**
   - Variable/function naming clarity
   - Code readability
   - Comment quality
   - Self-documenting code

3. **Error Handling**
   - Proper error handling
   - Edge case coverage
   - Input validation
   - Graceful degradation

4. **Performance**
   - Algorithmic efficiency
   - Resource management
   - Memory leaks
   - Unnecessary computations

5. **Testing**
   - Test coverage
   - Test quality
   - Edge cases tested
   - Integration test needs

6. **Maintainability**
   - Code complexity
   - Coupling and cohesion
   - Future extensibility
   - Technical debt

7. **Best Practices**
   - Framework/library conventions
   - Language idioms
   - Modern patterns
   - Anti-patterns

8. **JavaScript/Node.js Specific**
   - Async/await usage
   - Promise handling
   - Module imports
   - ES6+ features

Provide analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "comment",
  "quality_score": 1-10,
  "summary": "Overall quality assessment",
  "strengths": ["positive aspects found"],
  "issues": [
    {
      "severity": "critical" | "major" | "minor" | "nit",
      "category": "category name",
      "title": "issue title",
      "description": "detailed description",
      "location": "file:line",
      "suggestion": "how to improve",
      "example": "code example if helpful"
    }
  ],
  "refactoring_opportunities": ["suggested refactorings"],
  "complexity_notes": "code complexity observations",
  "maintainability_score": 1-10
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse response' };

  const report = {
    timestamp: new Date().toISOString(),
    pr_number: prNumber,
    agent: 'code-quality-agent',
    analysis,
    raw_response: responseText,
  };

  fs.writeFileSync('quality-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Code quality analysis complete. Quality Score: ${analysis.quality_score || 'N/A'}/10`);
  console.log(`   Issues found: ${analysis.issues?.length || 0}`);

  return report;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

analyzeCodeQuality(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Code quality agent error:', error);
    process.exit(1);
  });
