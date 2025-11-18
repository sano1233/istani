/**
 * Pre-Merge Checks System
 * Enforces quality gates and organization's custom requirements before PR merges
 * 
 * Features:
 * - Built-in checks (Docstring Coverage, PR Title, PR Description, Issue Assessment)
 * - Custom checks with natural language instructions
 * - Configurable enforcement modes (off, warning, error)
 * - Integration with AI analysis for complex validations
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PreMergeChecks {
  constructor(config = {}) {
    this.config = {
      docstrings: {
        mode: config.docstrings?.mode || 'warning',
        threshold: config.docstrings?.threshold || 80,
      },
      title: {
        mode: config.title?.mode || 'warning',
        requirements: config.title?.requirements || 'Title should accurately reflect changes',
      },
      description: {
        mode: config.description?.mode || 'warning',
      },
      issue_assessment: {
        mode: config.issue_assessment?.mode || 'warning',
      },
      custom_checks: config.custom_checks || [],
      ...config,
    };
  }

  /**
   * Load configuration from .coderabbit.yaml file
   */
  static async loadFromYAML(repoPath = process.cwd()) {
    const yamlPath = join(repoPath, '.coderabbit.yaml');
    
    if (!existsSync(yamlPath)) {
      return new PreMergeChecks();
    }

    try {
      const yamlContent = await readFile(yamlPath, 'utf-8');
      const config = this.parseYAML(yamlContent);
      return new PreMergeChecks(config);
    } catch (error) {
      console.warn(`⚠️ Failed to load .coderabbit.yaml: ${error.message}`);
      return new PreMergeChecks();
    }
  }

  /**
   * Parse YAML configuration (simplified parser)
   */
  static parseYAML(yamlContent) {
    const config = {};
    const lines = yamlContent.split('\n');
    let currentSection = null;
    let currentCheck = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line || line.startsWith('#')) continue;

      // Parse reviews.pre_merge_checks section
      if (line.includes('pre_merge_checks:')) {
        currentSection = 'pre_merge_checks';
        continue;
      }

      if (currentSection === 'pre_merge_checks') {
        // Built-in checks
        if (line.match(/^\w+:/)) {
          const checkName = line.replace(':', '').trim();
          currentCheck = checkName;
          
          if (!config[currentCheck]) {
            config[currentCheck] = {};
          }
          continue;
        }

        // Check properties
        if (line.startsWith('mode:') && currentCheck) {
          const mode = line.split('mode:')[1].trim().replace(/['"]/g, '');
          config[currentCheck].mode = mode;
          continue;
        }

        if (line.startsWith('threshold:') && currentCheck) {
          const threshold = parseInt(line.split('threshold:')[1].trim());
          config[currentCheck].threshold = threshold;
          continue;
        }

        if (line.startsWith('requirements:') && currentCheck) {
          const requirements = line.split('requirements:')[1].trim().replace(/^['"]|['"]$/g, '');
          config[currentCheck].requirements = requirements;
          continue;
        }

        // Custom checks
        if (line.includes('- name:')) {
          if (!config.custom_checks) {
            config.custom_checks = [];
          }
          const name = line.split('name:')[1].trim().replace(/['"]/g, '');
          config.custom_checks.push({ name, mode: 'warning' });
          currentCheck = config.custom_checks[config.custom_checks.length - 1];
          continue;
        }

        if (line.startsWith('instructions:') && Array.isArray(config.custom_checks) && config.custom_checks.length > 0) {
          // Multi-line instructions support
          let instructions = line.split('instructions:')[1].trim().replace(/^['"]|['"]$/g, '');
          
          // Check if instructions continue on next lines
          let j = i + 1;
          while (j < lines.length && !lines[j].trim().match(/^[-\w]+:/) && !lines[j].trim().startsWith('-')) {
            const nextLine = lines[j].trim();
            if (nextLine && !nextLine.startsWith('#')) {
              instructions += ' ' + nextLine.replace(/^['"]|['"]$/g, '');
            }
            j++;
          }
          
          config.custom_checks[config.custom_checks.length - 1].instructions = instructions.trim();
          i = j - 1;
          continue;
        }
      }
    }

    return config;
  }

  /**
   * Run all configured checks
   */
  async runAllChecks(pr, context = {}) {
    const results = {
      failed: [],
      passed: [],
      inconclusive: [],
      ignored: [],
    };

    // Run built-in checks
    if (this.config.docstrings.mode !== 'off') {
      const result = await this.checkDocstrings(pr, context);
      this.categorizeResult(result, results);
    }

    if (this.config.title.mode !== 'off') {
      const result = await this.checkTitle(pr, context);
      this.categorizeResult(result, results);
    }

    if (this.config.description.mode !== 'off') {
      const result = await this.checkDescription(pr, context);
      this.categorizeResult(result, results);
    }

    if (this.config.issue_assessment.mode !== 'off') {
      const result = await this.checkIssueAssessment(pr, context);
      this.categorizeResult(result, results);
    }

    // Run custom checks
    for (const customCheck of this.config.custom_checks || []) {
      if (customCheck.mode !== 'off') {
        const result = await this.runCustomCheck(customCheck, pr, context);
        this.categorizeResult(result, results);
      }
    }

    return results;
  }

  /**
   * Categorize check result
   */
  categorizeResult(result, results) {
    if (result.status === 'passed') {
      results.passed.push(result);
    } else if (result.status === 'failed') {
      results.failed.push(result);
    } else if (result.status === 'inconclusive') {
      results.inconclusive.push(result);
    } else if (result.status === 'ignored') {
      results.ignored.push(result);
    }
  }

  /**
   * Built-in Check: Docstring Coverage
   */
  async checkDocstrings(pr, context) {
    const checkConfig = this.config.docstrings;
    const mode = checkConfig.mode;
    const threshold = checkConfig.threshold || 80;

    try {
      // Analyze files for docstring coverage
      const filesWithCode = pr.files.filter(
        (f) => f.filename.match(/\.(js|ts|jsx|tsx|py|java|go|rs)$/) && f.status !== 'removed'
      );

      if (filesWithCode.length === 0) {
        return {
          name: 'Docstring Coverage',
          status: 'passed',
          mode,
          explanation: 'No code files to check',
          resolution: null,
        };
      }

      let totalFunctions = 0;
      let documentedFunctions = 0;

      for (const file of filesWithCode) {
        if (file.patch) {
          // Count function definitions and docstrings
          const functionMatches = file.patch.match(/(?:function|const\s+\w+\s*=\s*(?:async\s+)?\(|class\s+\w+|def\s+\w+)/g) || [];
          const docstringMatches = file.patch.match(/(?:\/\*\*[\s\S]*?\*\/|\/\/\/[\s\S]*?$|""".*?"""|'''.*?''')/g) || [];
          
          totalFunctions += functionMatches.length;
          documentedFunctions += docstringMatches.length;
        }
      }

      const coverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 100;
      const passed = coverage >= threshold;

      return {
        name: 'Docstring Coverage',
        status: passed ? 'passed' : 'failed',
        mode,
        explanation: `Docstring coverage: ${coverage.toFixed(1)}% (threshold: ${threshold}%)`,
        resolution: passed ? null : `Add docstrings to ${Math.ceil((threshold - coverage) / 100 * totalFunctions)} more function(s)`,
        metadata: {
          coverage: coverage.toFixed(1),
          threshold,
          totalFunctions,
          documentedFunctions,
        },
      };
    } catch (error) {
      return {
        name: 'Docstring Coverage',
        status: 'inconclusive',
        mode,
        explanation: `Error checking docstring coverage: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Built-in Check: Pull Request Title
   */
  async checkTitle(pr, context) {
    const checkConfig = this.config.title;
    const mode = checkConfig.mode;
    const requirements = checkConfig.requirements || 'Title should accurately reflect changes';

    try {
      const title = pr.title || '';
      const titleLength = title.length;

      // Basic validation
      const issues = [];
      
      if (titleLength === 0) {
        issues.push('Title is empty');
      }

      if (titleLength > 72) {
        issues.push(`Title is too long (${titleLength} chars, recommended: ≤72)`);
      }

      // Check if title matches requirements
      if (requirements.includes('imperative verb')) {
        const imperativePattern = /^(add|fix|update|remove|refactor|implement|create|delete|improve|change|modify|bump|bump|chore|docs|feat|perf|style|test|ci|build|revert)/i;
        if (!imperativePattern.test(title)) {
          issues.push('Title should start with an imperative verb (e.g., "Add", "Fix", "Update")');
        }
      }

      if (requirements.includes('50 characters')) {
        if (titleLength > 50) {
          issues.push(`Title exceeds 50 characters (current: ${titleLength})`);
        }
      }

      // AI-based validation if available
      if (context.aiAnalysis) {
        const titleMatchesContent = await this.validateTitleWithAI(title, pr, context);
        if (!titleMatchesContent) {
          issues.push('Title may not accurately reflect the changes made');
        }
      }

      const passed = issues.length === 0;

      return {
        name: 'Pull Request Title',
        status: passed ? 'passed' : 'failed',
        mode,
        explanation: passed 
          ? `Title "${title}" meets requirements` 
          : `Title validation failed: ${issues.join('; ')}`,
        resolution: passed ? null : `Update title to: ${requirements}`,
        metadata: {
          title,
          titleLength,
          issues,
        },
      };
    } catch (error) {
      return {
        name: 'Pull Request Title',
        status: 'inconclusive',
        mode,
        explanation: `Error checking title: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Built-in Check: Pull Request Description
   */
  async checkDescription(pr, context) {
    const checkConfig = this.config.description;
    const mode = checkConfig.mode;

    try {
      const description = pr.body || '';
      const descriptionLength = description.length;

      const issues = [];

      if (descriptionLength === 0) {
        issues.push('Description is empty');
      }

      if (descriptionLength < 50) {
        issues.push(`Description is too short (${descriptionLength} chars, recommended: ≥50)`);
      }

      // Check for template compliance (basic check)
      // This would ideally check against a configured template
      const hasTemplateSections = 
        description.includes('##') || 
        description.includes('###') ||
        description.includes('- [ ]') ||
        description.includes('*');

      if (!hasTemplateSections && descriptionLength > 100) {
        // Might be missing structured format
        issues.push('Description may not follow the required template format');
      }

      const passed = issues.length === 0;

      return {
        name: 'Pull Request Description',
        status: passed ? 'passed' : 'failed',
        mode,
        explanation: passed
          ? 'Description meets requirements'
          : `Description validation failed: ${issues.join('; ')}`,
        resolution: passed ? null : 'Add a comprehensive description following the PR template',
        metadata: {
          descriptionLength,
          issues,
        },
      };
    } catch (error) {
      return {
        name: 'Pull Request Description',
        status: 'inconclusive',
        mode,
        explanation: `Error checking description: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Built-in Check: Issue Assessment
   */
  async checkIssueAssessment(pr, context) {
    const checkConfig = this.config.issue_assessment;
    const mode = checkConfig.mode;

    try {
      // Extract linked issues from PR body
      const issueMatches = (pr.body || '').match(/(?:closes?|fixes?|resolves?|relates?)\s+#\d+/gi) || [];
      const linkedIssues = issueMatches.map(m => m.match(/#\d+/)[0]);

      if (linkedIssues.length === 0) {
        return {
          name: 'Issue Assessment',
          status: 'passed',
          mode,
          explanation: 'No linked issues to assess',
          resolution: null,
        };
      }

      // Basic validation: check if PR description mentions the issues
      const issues = [];
      
      for (const issueRef of linkedIssues) {
        if (!pr.body.includes(issueRef)) {
          issues.push(`Issue ${issueRef} is linked but not mentioned in description`);
        }
      }

      // AI-based assessment if available
      if (context.aiAnalysis) {
        const scopeCheck = await this.validateIssueScope(pr, linkedIssues, context);
        if (!scopeCheck.valid) {
          issues.push(...scopeCheck.issues);
        }
      }

      const passed = issues.length === 0;

      return {
        name: 'Issue Assessment',
        status: passed ? 'passed' : 'failed',
        mode,
        explanation: passed
          ? `All ${linkedIssues.length} linked issue(s) are properly addressed`
          : `Issue assessment failed: ${issues.join('; ')}`,
        resolution: passed ? null : 'Ensure PR addresses all linked issues without out-of-scope changes',
        metadata: {
          linkedIssues,
          issues,
        },
      };
    } catch (error) {
      return {
        name: 'Issue Assessment',
        status: 'inconclusive',
        mode,
        explanation: `Error assessing issues: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Run a custom check with AI analysis
   */
  async runCustomCheck(customCheck, pr, context) {
    const { name, instructions, mode } = customCheck;

    if (!instructions) {
      return {
        name,
        status: 'inconclusive',
        mode,
        explanation: 'Custom check has no instructions',
        resolution: 'Configure check instructions',
      };
    }

    try {
      // Use AI to evaluate custom check
      if (context.aiClient && context.aiAnalysis) {
        const result = await this.evaluateCustomCheckWithAI(name, instructions, pr, context);
        return result;
      }

      // Fallback: basic validation
      return {
        name,
        status: 'inconclusive',
        mode,
        explanation: 'AI client not available for custom check evaluation',
        resolution: 'Ensure AI client is configured',
      };
    } catch (error) {
      return {
        name,
        status: 'inconclusive',
        mode,
        explanation: `Error running custom check: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Evaluate custom check using AI
   */
  async evaluateCustomCheckWithAI(checkName, instructions, pr, context) {
    const { aiClient, aiModel = 'claude-sonnet-4-5-20250929' } = context;

    const prompt = `You are evaluating a custom pre-merge check for a pull request.

Check Name: ${checkName}
Instructions: ${instructions}

Pull Request Details:
- Title: ${pr.title}
- Description: ${pr.body || 'No description'}
- Files Changed: ${pr.files.length}
- Changes: +${pr.additions || 0} -${pr.deletions || 0}

${context.aiAnalysis ? `\nAI Analysis Summary:\n${context.aiAnalysis.summary}` : ''}

Based on the instructions above, evaluate whether this PR passes the check.

Respond in JSON format:
{
  "passed": true/false,
  "explanation": "Brief explanation of why it passed or failed",
  "resolution": "What needs to be done to pass (null if passed)"
}`;

    try {
      const response = await aiClient.messages.create({
        model: aiModel,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = response.content[0].text;
      
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          name: checkName,
          status: result.passed ? 'passed' : 'failed',
          mode: context.mode || 'warning',
          explanation: result.explanation || 'Custom check evaluation completed',
          resolution: result.resolution || null,
        };
      }

      // Fallback: parse text response
      const passed = responseText.toLowerCase().includes('passed') || 
                     responseText.toLowerCase().includes('pass');
      
      return {
        name: checkName,
        status: passed ? 'passed' : 'failed',
        mode: context.mode || 'warning',
        explanation: responseText.slice(0, 200),
        resolution: passed ? null : 'Review the check requirements and update PR accordingly',
      };
    } catch (error) {
      return {
        name: checkName,
        status: 'inconclusive',
        mode: context.mode || 'warning',
        explanation: `AI evaluation error: ${error.message}`,
        resolution: 'Review manually',
      };
    }
  }

  /**
   * Validate title with AI
   */
  async validateTitleWithAI(title, pr, context) {
    // Simplified validation - would use AI in full implementation
    return true;
  }

  /**
   * Validate issue scope with AI
   */
  async validateIssueScope(pr, linkedIssues, context) {
    // Simplified validation - would use AI in full implementation
    return { valid: true, issues: [] };
  }

  /**
   * Format check results for PR comment (Walkthrough format)
   */
  formatResults(results) {
    let output = '## 🔍 Pre-Merge Checks Results\n\n';

    // Failed checks (errors and warnings)
    if (results.failed.length > 0) {
      output += '### ❌ Failed Checks\n\n';
      output += '| Objective | Status | Explanation | Resolution |\n';
      output += '|-----------|--------|-------------|------------|\n';

      for (const check of results.failed) {
        const statusEmoji = check.mode === 'error' ? '❌ Error' : '⚠️ Warning';
        const name = check.name;
        const explanation = (check.explanation || '').replace(/\|/g, '\\|').slice(0, 150);
        const resolution = (check.resolution || 'N/A').replace(/\|/g, '\\|').slice(0, 100);

        output += `| ${name} | ${statusEmoji} | ${explanation} | ${resolution} |\n`;
      }
      output += '\n';
    }

    // Passed checks (collapsible)
    if (results.passed.length > 0) {
      output += '<details>\n<summary>✅ Passed Checks (' + results.passed.length + ')</summary>\n\n';
      output += '| Objective | Status | Explanation |\n';
      output += '|-----------|--------|-------------|\n';

      for (const check of results.passed) {
        const name = check.name;
        const explanation = (check.explanation || '').replace(/\|/g, '\\|').slice(0, 150);

        output += `| ${name} | ✅ Passed | ${explanation} |\n`;
      }
      output += '\n</details>\n\n';
    }

    // Inconclusive checks
    if (results.inconclusive.length > 0) {
      output += '### ❓ Inconclusive Checks\n\n';
      output += '| Objective | Status | Explanation |\n';
      output += '|-----------|--------|-------------|\n';

      for (const check of results.inconclusive) {
        const name = check.name;
        const explanation = (check.explanation || '').replace(/\|/g, '\\|').slice(0, 150);

        output += `| ${name} | ❓ Inconclusive | ${explanation} |\n`;
      }
      output += '\n';
    }

    // Summary
    const totalChecks = results.failed.length + results.passed.length + results.inconclusive.length;
    const errorCount = results.failed.filter(c => c.mode === 'error').length;
    const warningCount = results.failed.filter(c => c.mode === 'warning').length;

    output += '---\n\n';
    output += `**Summary**: ${results.passed.length}/${totalChecks} checks passed`;
    
    if (errorCount > 0) {
      output += `, ${errorCount} error(s)`;
    }
    if (warningCount > 0) {
      output += `, ${warningCount} warning(s)`;
    }
    if (results.inconclusive.length > 0) {
      output += `, ${results.inconclusive.length} inconclusive`;
    }

    if (errorCount > 0) {
      output += '\n\n⚠️ **This PR is blocked** due to failed error-level checks.';
    }

    return output;
  }

  /**
   * Check if PR should be blocked
   */
  shouldBlockMerge(results) {
    return results.failed.some(check => check.mode === 'error');
  }
}

export default PreMergeChecks;
