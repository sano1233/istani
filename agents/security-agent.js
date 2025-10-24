#!/usr/bin/env node

/**
 * Security Review Agent
 * Performs comprehensive security analysis of pull requests
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const { execSync } = require('child_process');
const fs = require('fs');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeSecurity(prNumber) {
  console.log(`🔒 Security Agent analyzing PR #${prNumber}...`);

  // Get PR diff
  const diff = execSync(`gh pr diff ${prNumber}`, { encoding: 'utf-8' });

  // Get PR details
  const prDetails = JSON.parse(
    execSync(`gh pr view ${prNumber} --json title,body,author,files`, {
      encoding: 'utf-8',
    })
  );

  // Security analysis prompt
  const prompt = `You are a security expert reviewing code changes for vulnerabilities and security issues.

PR Title: ${prDetails.title}
PR Author: ${prDetails.author.login}
PR Description: ${prDetails.body || 'No description provided'}

Files Changed: ${prDetails.files.map(f => f.path).join(', ')}

Code Diff:
\`\`\`diff
${diff.slice(0, 50000)}
\`\`\`

Perform a comprehensive security review focusing on:

1. **Authentication & Authorization**
   - Proper authentication mechanisms
   - Authorization checks
   - Session management
   - Token handling

2. **Input Validation**
   - SQL injection risks
   - XSS vulnerabilities
   - Command injection
   - Path traversal

3. **Sensitive Data**
   - Hardcoded secrets or API keys
   - Password storage
   - Personal data handling
   - Logging sensitive information

4. **Dependencies**
   - Vulnerable dependencies
   - Outdated packages
   - Insecure imports

5. **API Security**
   - CORS configuration
   - Rate limiting
   - API authentication
   - Data exposure

6. **Cryptography**
   - Weak algorithms
   - Improper key management
   - Insecure random number generation

7. **GitHub Actions Security** (if workflow files)
   - Secret handling
   - Injection attacks in workflows
   - Permissions scope
   - Third-party action security

Provide your analysis in JSON format:
{
  "verdict": "approve" | "request_changes" | "critical_block",
  "risk_level": "critical" | "high" | "medium" | "low" | "none",
  "summary": "Brief summary of security findings",
  "vulnerabilities": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "category name",
      "title": "vulnerability title",
      "description": "detailed description",
      "location": "file:line",
      "recommendation": "how to fix",
      "cwe_id": "CWE-XXX if applicable"
    }
  ],
  "secure_practices": ["list of good security practices found"],
  "compliance_notes": "any compliance considerations (GDPR, PCI-DSS, etc.)"
}`;

  // Call Claude for security analysis
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

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    pr_number: prNumber,
    agent: 'security-agent',
    analysis,
    raw_response: responseText,
  };

  fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));

  console.log(`✅ Security analysis complete. Risk Level: ${analysis.risk_level || 'unknown'}`);
  console.log(`   Vulnerabilities found: ${analysis.vulnerabilities?.length || 0}`);

  return report;
}

// Parse command line arguments
const args = process.argv.slice(2);
const prNumberArg = args.find(arg => arg.startsWith('--pr='));
const prNumber = prNumberArg ? prNumberArg.split('=')[1] : process.env.PR_NUMBER;

if (!prNumber) {
  console.error('❌ Error: PR number is required (--pr=NUMBER or PR_NUMBER env var)');
  process.exit(1);
}

analyzeSecurity(prNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Security agent error:', error);
    process.exit(1);
  });
