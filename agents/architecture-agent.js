#!/usr/bin/env node

/**
 * Architecture Review Agent
 * Analyzes architectural decisions and system design
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeArchitecture(prNumber) {
  console.log(`🏗️ Architecture Agent analyzing PR #${prNumber}...`);

  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  // Get project structure context
  let projectStructure = '';
  try {
    projectStructure = execSync('find . -type f -name "*.js" -o -name "*.ts" -o -name "*.json" | head -100', {
      encoding: 'utf-8',
    });
  } catch (e) {
    projectStructure = 'Could not retrieve project structure';
  }

  const prompt = `You are a software architect reviewing architectural decisions and system design.

PR Title: ${prDetails.title}
PR Description: ${prDetails.body || 'No description'}
Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

Project Structure Context:
${projectStructure}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Analyze architecture focusing on:

1. **Design Patterns**
   - Appropriate pattern usage
   - Pattern consistency
   - Anti-patterns
   - Design principles (SOLID)

2. **System Architecture**
   - Component boundaries
   - Separation of concerns
   - Modularity
   - Scalability considerations

3. **Dependencies**
   - Coupling levels
   - Dependency direction
   - Circular dependencies
   - Third-party library choices

4. **Data Flow**
   - Data architecture
   - State management
   - Data consistency
   - Transaction boundaries

5. **API Design**
   - Interface design
   - Contract stability
   - Versioning strategy
   - Backward compatibility

6. **Extension Points**
   - Plugin architecture
   - Customization points
   - Future extensibility
   - Configuration approach

7. **Integration**
   - External service integration
   - Message patterns
   - Event-driven design
   - Service boundaries

8. **Technical Debt**
   - Architectural debt
   - Workarounds
   - Quick fixes vs proper solutions
   - Migration paths

Provide analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "comment",
  "architectural_impact": "major" | "moderate" | "minor" | "none",
  "summary": "architectural assessment",
  "patterns_used": ["design patterns identified"],
  "concerns": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "category",
      "title": "concern title",
      "description": "detailed description",
      "location": "affected area",
      "impact": "what this affects",
      "recommendation": "architectural improvement",
      "alternatives": ["alternative approaches"]
    }
  ],
  "strengths": ["good architectural decisions"],
  "scalability_notes": "scalability considerations",
  "maintainability_impact": "how this affects maintainability",
  "technical_debt_notes": "technical debt considerations"
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
    agent: 'architecture-agent',
    analysis,
  };

  fs.writeFileSync('architecture-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Architecture analysis complete.`);
  console.log(`   Impact: ${analysis.architectural_impact || 'unknown'}`);

  return report;
}

const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required');
  process.exit(1);
}

analyzeArchitecture(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Architecture agent error:', error);
    process.exit(1);
  });
