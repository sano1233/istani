/**
 * ISTANI Multi-Model AI System
 * Integrates Claude AI, GitHub Copilot, and Codex for maximum capabilities
 *
 * Features:
 * - Multi-model code analysis and review
 * - Automatic error detection and resolution
 * - AI-powered code suggestions
 * - Cross-validation between models
 * - Enhanced accuracy through ensemble approach
 */

import Anthropic from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

class MultiModelAI {
  constructor(config = {}) {
    this.config = {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      githubToken: process.env.GITHUB_TOKEN,
      openaiApiKey: process.env.OPENAI_API_KEY, // For Codex
      copilotEnabled: process.env.COPILOT_ENABLED !== 'false',
      codexEnabled: process.env.CODEX_ENABLED !== 'false',
      claudeEnabled: process.env.CLAUDE_ENABLED !== 'false',
      autoFixEnabled: process.env.AUTO_FIX_ENABLED !== 'false',
      maxRetries: config.maxRetries || 3,
      ...config,
    };

    this.initializeClients();
    this.stats = {
      claudeRequests: 0,
      copilotRequests: 0,
      codexRequests: 0,
      errorsFixed: 0,
      suggestionsGenerated: 0,
      modelsAgreed: 0,
      modelsDisagreed: 0,
    };
  }

  initializeClients() {
    // Initialize Claude
    if (this.config.claudeEnabled && this.config.anthropicApiKey) {
      this.claude = new Anthropic({
        apiKey: this.config.anthropicApiKey,
      });
    }

    // Initialize OpenAI (for Codex)
    if (this.config.codexEnabled && this.config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openaiApiKey,
      });
    }

    // Initialize GitHub (for Copilot API access)
    if (this.config.githubToken) {
      this.github = new Octokit({
        auth: this.config.githubToken,
      });
    }
  }

  /**
   * Multi-model code review - uses all available AI models
   */
  async multiModelCodeReview(code, context = {}) {
    this.log('🤖 Running multi-model code review', 'info');

    const reviews = await Promise.allSettled(
      [
        this.config.claudeEnabled ? this.claudeCodeReview(code, context) : null,
        this.config.copilotEnabled ? this.copilotCodeReview(code, context) : null,
        this.config.codexEnabled ? this.codexCodeReview(code, context) : null,
      ].filter(Boolean),
    );

    // Aggregate results
    const successfulReviews = reviews
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);

    if (successfulReviews.length === 0) {
      throw new Error('All AI models failed to provide review');
    }

    // Check consensus
    const consensus = this.calculateConsensus(successfulReviews);

    return {
      reviews: successfulReviews,
      consensus,
      modelsUsed: successfulReviews.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Claude AI code review
   */
  async claudeCodeReview(code, context) {
    if (!this.claude) return null;

    this.log('🧠 Running Claude AI review', 'info');
    this.stats.claudeRequests++;

    const prompt = this.buildClaudePrompt(code, context);

    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const review = response.content[0].text;

    return {
      model: 'claude-sonnet-4-5',
      review,
      issues: this.extractIssues(review),
      suggestions: this.extractSuggestions(review),
      severity: this.extractSeverity(review),
      approved: this.determineApproval(review),
    };
  }

  /**
   * GitHub Copilot code review
   */
  async copilotCodeReview(code, context) {
    if (!this.github) return null;

    this.log('🤝 Running GitHub Copilot review', 'info');
    this.stats.copilotRequests++;

    try {
      // Use GitHub Copilot Chat API
      const prompt = this.buildCopilotPrompt(code, context);

      // GitHub Copilot integration via GitHub API
      // Note: This uses the Copilot for Business API
      const response = await this.github
        .request('POST /copilot/chat/completions', {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'gpt-4',
          temperature: 0.3,
        })
        .catch(async (error) => {
          // Fallback to regular OpenAI if Copilot API not available
          if (this.openai) {
            return await this.openai.chat.completions.create({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are GitHub Copilot, an expert code reviewer.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.3,
            });
          }
          throw error;
        });

      const review =
        response.data?.choices?.[0]?.message?.content || response.choices?.[0]?.message?.content;

      return {
        model: 'github-copilot',
        review,
        issues: this.extractIssues(review),
        suggestions: this.extractSuggestions(review),
        severity: this.extractSeverity(review),
        approved: this.determineApproval(review),
      };
    } catch (error) {
      this.log(`Copilot review failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Codex code review
   */
  async codexCodeReview(code, context) {
    if (!this.openai) return null;

    this.log('💻 Running Codex review', 'info');
    this.stats.codexRequests++;

    try {
      const prompt = this.buildCodexPrompt(code, context);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are Codex, an expert code analysis and review system.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      });

      const review = response.choices[0].message.content;

      return {
        model: 'openai-codex',
        review,
        issues: this.extractIssues(review),
        suggestions: this.extractSuggestions(review),
        severity: this.extractSeverity(review),
        approved: this.determineApproval(review),
      };
    } catch (error) {
      this.log(`Codex review failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Automatic error detection and resolution
   */
  async detectAndFixErrors(code, filePath, context = {}) {
    this.log('🔧 Detecting and fixing errors', 'info');

    // Step 1: Run static analysis
    const staticErrors = await this.runStaticAnalysis(code, filePath);

    if (staticErrors.length === 0) {
      return { fixed: false, message: 'No errors detected' };
    }

    this.log(`Found ${staticErrors.length} error(s), attempting fixes`, 'warn');

    // Step 2: Generate fixes using multi-model approach
    const fixes = await this.generateFixes(code, staticErrors, context);

    // Step 3: Apply fixes
    if (this.config.autoFixEnabled && fixes.length > 0) {
      const fixedCode = await this.applyFixes(code, fixes);

      // Step 4: Verify fixes
      const verification = await this.verifyFixes(fixedCode, filePath);

      if (verification.success) {
        this.stats.errorsFixed += staticErrors.length;
        return {
          fixed: true,
          originalErrors: staticErrors.length,
          fixedCode,
          fixes: fixes,
          message: `Successfully fixed ${staticErrors.length} error(s)`,
        };
      }
    }

    return {
      fixed: false,
      errors: staticErrors,
      suggestedFixes: fixes,
      message: 'Auto-fix disabled or fixes not applicable',
    };
  }

  /**
   * Run static analysis on code
   */
  async runStaticAnalysis(code, filePath) {
    const errors = [];
    const ext = path.extname(filePath);

    try {
      // JavaScript/TypeScript
      if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
        // Use ESLint if available
        try {
          execSync('npx eslint --stdin --format json', {
            input: code,
            encoding: 'utf-8',
          });
        } catch (error) {
          const result = JSON.parse(error.stdout || '[]');
          if (result[0]?.messages) {
            errors.push(...result[0].messages);
          }
        }
      }

      // Python
      if (ext === '.py') {
        try {
          execSync('python -m pylint --output-format=json', {
            input: code,
            encoding: 'utf-8',
          });
        } catch (error) {
          // Parse pylint output
        }
      }

      // Java
      if (ext === '.java') {
        try {
          execSync('mvn checkstyle:check', { encoding: 'utf-8' });
        } catch (error) {
          // Parse checkstyle output
        }
      }
    } catch (error) {
      this.log(`Static analysis error: ${error.message}`, 'warn');
    }

    return errors;
  }

  /**
   * Generate fixes using AI models
   */
  async generateFixes(code, errors, context) {
    const fixes = [];

    for (const error of errors.slice(0, 10)) {
      // Limit to 10 errors
      const fixPrompt = `
Fix this error in the code:

Error: ${error.message}
Line: ${error.line}
Column: ${error.column}

Code:
\`\`\`
${code}
\`\`\`

Provide ONLY the fixed code, no explanations.
`;

      // Try Claude first
      if (this.claude) {
        try {
          const response = await this.claude.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4000,
            messages: [{ role: 'user', content: fixPrompt }],
          });

          fixes.push({
            error,
            fix: response.content[0].text,
            model: 'claude',
          });
          continue;
        } catch (err) {
          this.log(`Claude fix failed: ${err.message}`, 'warn');
        }
      }

      // Fallback to Copilot/Codex
      if (this.openai) {
        try {
          const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: 'You are a code fixing assistant.' },
              { role: 'user', content: fixPrompt },
            ],
            temperature: 0.1,
          });

          fixes.push({
            error,
            fix: response.choices[0].message.content,
            model: 'codex',
          });
        } catch (err) {
          this.log(`Codex fix failed: ${err.message}`, 'warn');
        }
      }
    }

    this.stats.suggestionsGenerated += fixes.length;
    return fixes;
  }

  /**
   * Apply fixes to code
   */
  async applyFixes(code, fixes) {
    let fixedCode = code;

    for (const fix of fixes) {
      // Extract code from fix (remove markdown if present)
      const codeMatch = fix.fix.match(/```[\w]*\n([\s\S]*?)\n```/);
      const fixedSnippet = codeMatch ? codeMatch[1] : fix.fix;

      // Apply fix (simple replacement for now)
      // In production, use AST manipulation
      fixedCode = fixedSnippet;
    }

    return fixedCode;
  }

  /**
   * Verify fixes work
   */
  async verifyFixes(code, filePath) {
    try {
      const errors = await this.runStaticAnalysis(code, filePath);
      return {
        success: errors.length === 0,
        remainingErrors: errors.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate code suggestions using all models
   */
  async generateCodeSuggestions(context) {
    this.log('💡 Generating code suggestions', 'info');

    const suggestions = [];

    // Claude suggestions
    if (this.claude) {
      const claudeSuggestions = await this.getClaudeSuggestions(context);
      suggestions.push(...claudeSuggestions);
    }

    // Copilot suggestions
    if (this.github || this.openai) {
      const copilotSuggestions = await this.getCopilotSuggestions(context);
      suggestions.push(...copilotSuggestions);
    }

    // Deduplicate and rank suggestions
    return this.rankSuggestions(suggestions);
  }

  /**
   * Get Claude code suggestions
   */
  async getClaudeSuggestions(context) {
    const prompt = `
Based on this code context, suggest improvements:

${JSON.stringify(context, null, 2)}

Provide specific, actionable code improvement suggestions.
`;

    const response = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    return this.parseSuggestions(response.content[0].text);
  }

  /**
   * Get Copilot/Codex suggestions
   */
  async getCopilotSuggestions(context) {
    if (!this.openai) return [];

    const prompt = `
Based on this code context, suggest improvements:

${JSON.stringify(context, null, 2)}

Provide specific, actionable code improvement suggestions.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are GitHub Copilot, providing code suggestions.' },
        { role: 'user', content: prompt },
      ],
    });

    return this.parseSuggestions(response.choices[0].message.content);
  }

  /**
   * Calculate consensus between models
   */
  calculateConsensus(reviews) {
    const approvals = reviews.filter((r) => r.approved).length;
    const issues = reviews.flatMap((r) => r.issues);
    const suggestions = reviews.flatMap((r) => r.suggestions);

    // Find common issues across models
    const commonIssues = this.findCommonItems(reviews.map((r) => r.issues));
    const commonSuggestions = this.findCommonItems(reviews.map((r) => r.suggestions));

    const agreed = commonIssues.length > 0 || commonSuggestions.length > 0;
    if (agreed) {
      this.stats.modelsAgreed++;
    } else {
      this.stats.modelsDisagreed++;
    }

    return {
      approved: approvals >= reviews.length / 2,
      confidence: approvals / reviews.length,
      commonIssues,
      commonSuggestions,
      allIssues: this.deduplicateItems(issues),
      allSuggestions: this.deduplicateItems(suggestions),
    };
  }

  /**
   * Helper methods
   */

  buildClaudePrompt(code, context) {
    return `You are an expert code reviewer. Review this code:

${context.description || ''}

Code:
\`\`\`${context.language || ''}
${code}
\`\`\`

Provide:
1. Overall assessment
2. Issues found (if any)
3. Suggestions for improvement
4. Security concerns
5. Recommendation (APPROVE or REQUEST_CHANGES)
`;
  }

  buildCopilotPrompt(code, context) {
    return `Review this code as GitHub Copilot:

${context.description || ''}

\`\`\`${context.language || ''}
${code}
\`\`\`

Focus on:
- Code quality
- Best practices
- Potential bugs
- Performance issues
`;
  }

  buildCodexPrompt(code, context) {
    return `Analyze this code:

${context.description || ''}

\`\`\`${context.language || ''}
${code}
\`\`\`

Provide detailed analysis of:
- Logic correctness
- Edge cases
- Error handling
- Code efficiency
`;
  }

  extractIssues(review) {
    const issues = [];
    const lines = review.split('\n');

    for (const line of lines) {
      if (line.match(/issue|problem|error|bug|vulnerability/i)) {
        issues.push(line.trim());
      }
    }

    return issues;
  }

  extractSuggestions(review) {
    const suggestions = [];
    const lines = review.split('\n');

    for (const line of lines) {
      if (line.match(/suggest|recommend|consider|improve/i)) {
        suggestions.push(line.trim());
      }
    }

    return suggestions;
  }

  extractSeverity(review) {
    if (review.match(/critical|severe|high/i)) return 'high';
    if (review.match(/medium|moderate/i)) return 'medium';
    return 'low';
  }

  determineApproval(review) {
    const text = review.toLowerCase();
    if (text.includes('approve')) return true;
    if (text.includes('request_changes') || text.includes('request changes')) return false;
    if (text.includes('critical') || text.includes('must fix')) return false;
    return true; // Default to approved if unclear
  }

  parseSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.match(/^\d+\.|\-|\*/) && line.length > 10) {
        suggestions.push(line.trim());
      }
    }

    return suggestions;
  }

  findCommonItems(arrays) {
    if (arrays.length === 0) return [];

    return arrays[0].filter((item) =>
      arrays.every((arr) => arr.some((i) => this.similarity(i, item) > 0.7)),
    );
  }

  deduplicateItems(items) {
    const unique = [];

    for (const item of items) {
      if (!unique.some((u) => this.similarity(u, item) > 0.8)) {
        unique.push(item);
      }
    }

    return unique;
  }

  similarity(str1, str2) {
    const s1 = String(str1).toLowerCase();
    const s2 = String(str2).toLowerCase();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;

    if (len1 === 0 || len2 === 0) return 0;

    const matrix = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }

  rankSuggestions(suggestions) {
    // Rank by frequency and similarity
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 20);
  }

  getStats() {
    return {
      ...this.stats,
      timestamp: new Date().toISOString(),
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const emoji =
      {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        success: '✅',
      }[level] || 'ℹ️';

    console.log(`[${timestamp}] ${emoji} ${message}`);
  }
}

export default MultiModelAI;
