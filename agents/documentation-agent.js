#!/usr/bin/env node

/**
 * Documentation Review Agent
 * Ensures code is properly documented and readable
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeDocumentation(prNumber) {
  console.log(`📚 Documentation Agent analyzing PR #${prNumber}...`);

  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  const prompt = `You are a technical documentation expert reviewing code documentation.

PR Title: ${prDetails.title}
PR Description: ${prDetails.body || 'No description'}
Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Analyze documentation quality focusing on:

1. **Code Comments**
   - Function/method documentation
   - Complex logic explanation
   - JSDoc/TypeDoc completeness
   - Comment clarity and usefulness

2. **API Documentation**
   - Endpoint documentation
   - Parameter descriptions
   - Return value documentation
   - Error documentation

3. **README Updates**
   - New features documented
   - Usage examples
   - Configuration docs
   - Breaking changes noted

4. **Inline Documentation**
   - Complex algorithms explained
   - Business logic clarity
   - Non-obvious code explained
   - TODOs and FIXMEs

5. **Type Definitions**
   - TypeScript/JSDoc types
   - Interface documentation
   - Generic types explained
   - Type constraints documented

6. **Examples**
   - Usage examples
   - Code samples
   - Common patterns
   - Edge cases documented

Provide analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "comment",
  "documentation_score": 1-10,
  "summary": "documentation assessment",
  "strengths": ["well-documented aspects"],
  "gaps": [
    {
      "severity": "high" | "medium" | "low",
      "type": "comment" | "readme" | "api" | "example",
      "description": "what's missing",
      "location": "file:line or section",
      "suggestion": "documentation to add",
      "example": "example documentation"
    }
  ],
  "readme_needs_update": true/false,
  "api_docs_needed": ["undocumented APIs"],
  "suggested_examples": ["examples to add"]
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
    agent: 'documentation-agent',
    analysis,
  };

  fs.writeFileSync('docs-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Documentation analysis complete. Score: ${analysis.documentation_score || 'N/A'}/10`);

  return report;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

analyzeDocumentation(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Documentation agent error:', error);
    process.exit(1);
  });
