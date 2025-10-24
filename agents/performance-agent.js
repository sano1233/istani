#!/usr/bin/env node

/**
 * Performance Review Agent
 * Analyzes code for performance issues and optimization opportunities
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzePerformance(prNumber) {
  console.log(`⚡ Performance Agent analyzing PR #${prNumber}...`);

  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  const prompt = `You are a performance optimization expert reviewing code changes.

PR Title: ${prDetails.title}
Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Analyze performance focusing on:

1. **Algorithmic Efficiency**
   - Time complexity
   - Space complexity
   - Unnecessary iterations
   - Optimization opportunities

2. **Resource Management**
   - Memory usage
   - Memory leaks
   - Resource cleanup
   - Connection pooling

3. **Async Operations**
   - Promise handling
   - Parallel vs sequential
   - Race conditions
   - Blocking operations

4. **Data Handling**
   - Large data processing
   - Unnecessary data copies
   - Streaming opportunities
   - Caching strategies

5. **Frontend Performance** (if applicable)
   - Bundle size impact
   - Render performance
   - Lazy loading
   - Code splitting

6. **Database Queries** (if applicable)
   - Query efficiency
   - N+1 problems
   - Index usage
   - Batch operations

7. **API Performance**
   - Response times
   - Payload sizes
   - Rate limiting
   - Caching headers

Provide analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "comment",
  "performance_impact": "positive" | "neutral" | "negative",
  "summary": "performance assessment",
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "category",
      "title": "issue title",
      "description": "detailed description",
      "location": "file:line",
      "current_complexity": "O(n^2) etc",
      "optimization": "how to improve",
      "expected_improvement": "description"
    }
  ],
  "optimizations": ["optimization suggestions"],
  "benchmarking_recommendations": ["what to benchmark"],
  "monitoring_suggestions": ["metrics to monitor"]
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
    agent: 'performance-agent',
    analysis,
  };

  fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Performance analysis complete.`);
  console.log(`   Impact: ${analysis.performance_impact || 'unknown'}`);

  return report;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

analyzePerformance(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Performance agent error:', error);
    process.exit(1);
  });
