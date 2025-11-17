/**
 * ISTANI Enhanced Autonomous AI Agent
 * Integrates Claude AI, GitHub Copilot, and Codex for maximum capabilities
 * Includes automatic error detection, resolution, and code enhancement
 */

import IstaniAIAgent from './agent.mjs';
import MultiModelAI from './multi-model-ai.mjs';
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

class EnhancedIstaniAgent extends IstaniAIAgent {
  constructor(config = {}) {
    super(config);

    // Initialize multi-model AI system
    this.multiModelAI = new MultiModelAI({
      anthropicApiKey: this.config.anthropicApiKey,
      githubToken: this.config.githubToken,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      copilotEnabled: config.copilotEnabled !== false,
      codexEnabled: config.codexEnabled !== false,
      autoFixEnabled: config.autoFixEnabled !== false,
    });

    this.enhancedStats = {
      ...this.stats,
      autoFixesApplied: 0,
      modelsUsed: 0,
      consensusReached: 0,
      errorsAutoResolved: 0,
      codeSuggestionsGenerated: 0,
    };
  }

  /**
   * Enhanced PR processing with multi-model AI
   */
  async processPullRequest(prNumber) {
    const startTime = Date.now();
    this.log(`🚀 Enhanced AI Agent processing PR #${prNumber}`, 'info');

    try {
      // 1. Fetch PR details
      const pr = await this.fetchPRDetails(prNumber);
      this.log(`📋 PR: "${pr.title}" by @${pr.user.login}`, 'info');

      // 2. Security scan
      if (this.config.securityEnabled) {
        await this.securityScan(pr);
      }

      // 3. Enhanced analysis with multi-model AI
      const analysis = await this.enhancedAnalyzePR(pr);

      // 4. Multi-model code review
      const review = await this.enhancedCodeReview(pr, analysis);

      // 5. Automatic error detection and fixing
      const errorResolution = await this.detectAndResolveErrors(pr);

      // 6. Post comprehensive review
      await this.postEnhancedReview(pr, review, errorResolution);

      // 7. Auto-fix errors if found
      if (errorResolution.fixesAvailable && this.config.autoFixEnabled) {
        await this.applyAutoFixes(pr, errorResolution);
      }

      // 8. Run builds with fixed code
      const buildResult = await this.runBuild(pr);

      // 9. Run tests
      const testResult = await this.runTests(pr);

      // 10. Deploy if all checks pass
      if (buildResult.success && testResult.success && review.approved) {
        if (this.config.autoDeploy) {
          await this.deployToProduction(pr);
        }

        if (this.config.autoMerge && review.approved) {
          await this.mergePullRequest(pr);
        }
      }

      this.enhancedStats.prsProcessed++;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.log(`✅ Enhanced processing completed for PR #${prNumber} in ${duration}s`, 'success');

      return {
        success: true,
        prNumber,
        duration,
        review,
        errorResolution,
        buildResult,
        testResult,
        modelsUsed: analysis.modelsUsed,
      };
    } catch (error) {
      this.log(`❌ Error in enhanced processing of PR #${prNumber}: ${error.message}`, 'error');
      await this.handleError(prNumber, error);
      throw error;
    }
  }

  /**
   * Enhanced PR analysis using multi-model AI
   */
  async enhancedAnalyzePR(pr) {
    this.log(`🔍 Enhanced analysis with ${this.getAvailableModels().join(', ')}`, 'info');

    const filesAnalysis = [];

    for (const file of pr.files.slice(0, 20)) {
      try {
        if (file.status === 'removed') continue;

        const { data } = await this.github.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: file.filename,
          ref: pr.head.sha,
        });

        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        // Multi-model analysis
        const multiReview = await this.multiModelAI.multiModelCodeReview(content, {
          filename: file.filename,
          language: this.detectLanguage(file.filename),
          description: `File: ${file.filename} in PR #${pr.number}`,
          patch: file.patch,
        });

        filesAnalysis.push({
          file: file.filename,
          ...multiReview,
        });
      } catch (error) {
        this.log(`Failed to analyze ${file.filename}: ${error.message}`, 'warn');
      }
    }

    this.enhancedStats.modelsUsed += filesAnalysis.reduce((sum, f) => sum + f.modelsUsed, 0);
    this.enhancedStats.consensusReached += filesAnalysis.filter((f) => f.consensus.approved).length;

    return {
      filesAnalysis,
      modelsUsed: filesAnalysis[0]?.modelsUsed || 0,
      overallConsensus: this.calculateOverallConsensus(filesAnalysis),
    };
  }

  /**
   * Enhanced code review with multiple AI models
   */
  async enhancedCodeReview(pr, analysis) {
    this.log(`📝 Enhanced code review with multi-model consensus`, 'info');

    const allIssues = analysis.filesAnalysis.flatMap((f) => f.consensus.allIssues);
    const allSuggestions = analysis.filesAnalysis.flatMap((f) => f.consensus.allSuggestions);
    const approved = analysis.overallConsensus.approved;

    const reviewText = this.formatEnhancedReview({
      filesAnalyzed: analysis.filesAnalysis.length,
      modelsUsed: analysis.modelsUsed,
      consensus: analysis.overallConsensus,
      issues: allIssues,
      suggestions: allSuggestions,
    });

    this.stats.codeReviewsCompleted++;

    return {
      text: reviewText,
      approved,
      confidence: analysis.overallConsensus.confidence,
      modelsUsed: analysis.modelsUsed,
      issues: allIssues,
      suggestions: allSuggestions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detect and resolve errors automatically
   */
  async detectAndResolveErrors(pr) {
    this.log(`🔧 Detecting and resolving errors automatically`, 'info');

    const fixes = [];
    let totalErrors = 0;

    for (const file of pr.files.slice(0, 10)) {
      try {
        if (file.status === 'removed') continue;

        const { data } = await this.github.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: file.filename,
          ref: pr.head.sha,
        });

        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        // Detect and fix errors
        const result = await this.multiModelAI.detectAndFixErrors(content, file.filename, {
          prNumber: pr.number,
        });

        if (result.fixed || result.suggestedFixes?.length > 0) {
          fixes.push({
            file: file.filename,
            ...result,
          });

          totalErrors += result.originalErrors || result.errors?.length || 0;
        }
      } catch (error) {
        this.log(`Error resolution failed for ${file.filename}: ${error.message}`, 'warn');
      }
    }

    this.enhancedStats.errorsAutoResolved += fixes.filter((f) => f.fixed).length;
    this.enhancedStats.autoFixesApplied += fixes.length;

    return {
      fixesAvailable: fixes.length > 0,
      fixes,
      totalErrors,
      fixedErrors: fixes.filter((f) => f.fixed).length,
    };
  }

  /**
   * Apply automatic fixes to PR
   */
  async applyAutoFixes(pr, errorResolution) {
    this.log(`🔨 Applying ${errorResolution.fixes.length} automatic fix(es)`, 'info');

    for (const fix of errorResolution.fixes) {
      if (!fix.fixed || !fix.fixedCode) continue;

      try {
        // Get current file SHA
        const { data: fileData } = await this.github.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: fix.file,
          ref: pr.head.ref,
        });

        // Update file with fixed code
        await this.github.repos.createOrUpdateFileContents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: fix.file,
          message: `🤖 Auto-fix: Resolved ${fix.originalErrors} error(s) in ${fix.file}`,
          content: Buffer.from(fix.fixedCode).toString('base64'),
          sha: fileData.sha,
          branch: pr.head.ref,
        });

        this.log(`✅ Applied fixes to ${fix.file}`, 'success');
      } catch (error) {
        this.log(`Failed to apply fixes to ${fix.file}: ${error.message}`, 'error');
      }
    }

    // Post comment about auto-fixes
    await this.postAutoFixComment(pr, errorResolution);
  }

  /**
   * Post enhanced review with multi-model insights
   */
  async postEnhancedReview(pr, review, errorResolution) {
    const comment = this.formatEnhancedReviewComment(review, errorResolution);

    await this.github.issues.createComment({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: pr.number,
      body: comment,
    });

    // Submit review
    await this.github.pulls.createReview({
      owner: this.config.owner,
      repo: this.config.repo,
      pull_number: pr.number,
      event: review.approved ? 'APPROVE' : 'COMMENT',
      body: review.text,
    });
  }

  /**
   * Post auto-fix comment
   */
  async postAutoFixComment(pr, errorResolution) {
    const comment =
      `## 🤖 Automatic Error Resolution\n\n` +
      `I've automatically detected and fixed errors in this PR:\n\n` +
      `- **Total errors found**: ${errorResolution.totalErrors}\n` +
      `- **Errors fixed**: ${errorResolution.fixedErrors}\n` +
      `- **Files updated**: ${errorResolution.fixes.length}\n\n` +
      `### Fixed Files:\n\n` +
      errorResolution.fixes
        .map((fix) => `- ✅ **${fix.file}**: Fixed ${fix.originalErrors} error(s)`)
        .join('\n') +
      `\n\n*Fixes applied by ISTANI Enhanced AI Agent using Claude, Copilot, and Codex*`;

    await this.github.issues.createComment({
      owner: this.config.owner,
      repo: this.config.repo,
      issue_number: pr.number,
      body: comment,
    });
  }

  /**
   * Format enhanced review comment
   */
  formatEnhancedReviewComment(review, errorResolution) {
    const emoji = review.approved ? '✅' : '⚠️';
    const status = review.approved ? 'APPROVED' : 'CHANGES REQUESTED';

    return (
      `## ${emoji} Enhanced Multi-Model AI Review - ${status}\n\n` +
      `**Models Used**: ${review.modelsUsed} (Claude, ${this.multiModelAI.config.copilotEnabled ? 'Copilot, ' : ''}${this.multiModelAI.config.codexEnabled ? 'Codex' : ''})\n` +
      `**Confidence**: ${(review.confidence * 100).toFixed(1)}%\n` +
      `**Timestamp**: ${review.timestamp}\n\n` +
      `---\n\n` +
      (errorResolution.fixesAvailable
        ? `### 🔧 Error Detection\n\n` +
          `- Found ${errorResolution.totalErrors} error(s)\n` +
          `- Auto-fixed ${errorResolution.fixedErrors} error(s)\n\n`
        : '') +
      `### 📊 Review Summary\n\n${review.text}\n\n` +
      (review.issues.length > 0
        ? `### ⚠️ Issues Found\n\n${review.issues
            .slice(0, 10)
            .map((i) => `- ${i}`)
            .join('\n')}\n\n`
        : '') +
      (review.suggestions.length > 0
        ? `### 💡 Suggestions\n\n${review.suggestions
            .slice(0, 10)
            .map((s) => `- ${s}`)
            .join('\n')}\n\n`
        : '') +
      `---\n\n` +
      `*Enhanced review by ISTANI AI Agent - Powered by Claude AI, GitHub Copilot & Codex*`
    );
  }

  /**
   * Format enhanced review text
   */
  formatEnhancedReview(data) {
    return `# Enhanced Multi-Model Code Review

## Overview
- **Files Analyzed**: ${data.filesAnalyzed}
- **AI Models Used**: ${data.modelsUsed}
- **Consensus Confidence**: ${(data.consensus.confidence * 100).toFixed(1)}%
- **Recommendation**: ${data.consensus.approved ? 'APPROVE' : 'REQUEST_CHANGES'}

## Analysis

### Code Quality Assessment
The code has been reviewed by multiple AI models (Claude AI, GitHub Copilot, and Codex) for comprehensive analysis.

${
  data.issues.length > 0
    ? `### Issues Identified (${data.issues.length})
${data.issues
  .slice(0, 15)
  .map((issue, i) => `${i + 1}. ${issue}`)
  .join('\n')}
`
    : '### ✅ No Critical Issues Found'
}

${
  data.suggestions.length > 0
    ? `### Improvement Suggestions (${data.suggestions.length})
${data.suggestions
  .slice(0, 15)
  .map((suggestion, i) => `${i + 1}. ${suggestion}`)
  .join('\n')}
`
    : ''
}

## Verdict
${
  data.consensus.approved
    ? '✅ **APPROVED** - All AI models agree this code meets quality standards.'
    : '⚠️ **CHANGES REQUESTED** - Please address the issues identified above.'
}
`;
  }

  /**
   * Calculate overall consensus from file analyses
   */
  calculateOverallConsensus(filesAnalysis) {
    if (filesAnalysis.length === 0) {
      return { approved: false, confidence: 0 };
    }

    const approvals = filesAnalysis.filter((f) => f.consensus.approved).length;
    const confidence = approvals / filesAnalysis.length;

    return {
      approved: confidence >= 0.7, // Require 70% approval
      confidence,
      totalFiles: filesAnalysis.length,
      approvedFiles: approvals,
    };
  }

  /**
   * Get available AI models
   */
  getAvailableModels() {
    const models = [];
    if (this.multiModelAI.claude) models.push('Claude AI');
    if (this.multiModelAI.github || this.multiModelAI.openai) models.push('GitHub Copilot');
    if (this.multiModelAI.openai) models.push('Codex');
    return models;
  }

  /**
   * Detect programming language from filename
   */
  detectLanguage(filename) {
    const ext = path.extname(filename);
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
    };
    return langMap[ext] || 'plaintext';
  }

  /**
   * Get enhanced statistics
   */
  getEnhancedStats() {
    return {
      ...this.getStats(),
      ...this.enhancedStats,
      multiModelAI: this.multiModelAI.getStats(),
    };
  }
}

export default EnhancedIstaniAgent;
