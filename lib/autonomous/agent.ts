import 'server-only';
import { aiOrchestrator } from './multi-ai-orchestrator';
import { kv } from '@/lib/cloudflare/kv';

export interface AnalysisResult {
  analysisId: string;
  summary: string;
  approved: boolean;
  confidence: number;
  recommendations: string[];
  risks: string[];
  timestamp: Date;
}

export interface AutoResolveResult {
  success: boolean;
  solution: string;
  confidence: number;
  appliedChanges: string[];
}

/**
 * Fully Autonomous AI Agent
 * Capabilities:
 * - Auto-analyze code, PRs, issues
 * - Auto-resolve bugs and conflicts
 * - Auto-merge with consensus
 * - Self-improvement through feedback loops
 */
export class AutonomousAgent {
  /**
   * Auto-analyze a pull request
   */
  async analyzePullRequest(prData: {
    title: string;
    body: string;
    files: Array<{ filename: string; changes: string }>;
  }): Promise<AnalysisResult> {
    console.log('🤖 Autonomous Agent: Analyzing PR...');

    const prompt = `Analyze this pull request thoroughly:

TITLE: ${prData.title}

DESCRIPTION:
${prData.body}

FILES CHANGED (${prData.files.length}):
${prData.files.map((f) => `- ${f.filename}`).join('\n')}

DETAILED CHANGES:
${prData.files.map((f) => `\n=== ${f.filename} ===\n${f.changes}`).join('\n')}

Provide:
1. Summary of changes
2. Approval recommendation (APPROVE or REQUEST_CHANGES)
3. Security concerns
4. Performance implications
5. Code quality assessment

Format your response as:
SUMMARY: [one sentence]
DECISION: [APPROVE or REQUEST_CHANGES]
RISKS: [list any concerns]
RECOMMENDATIONS: [list improvements]`;

    const result = await aiOrchestrator.analyzeWithAllModels(prompt);

    // Extract structured data from responses
    const summary = this.extractSection(result.primaryResponse, 'SUMMARY');
    const decision = this.extractSection(result.primaryResponse, 'DECISION');
    const risks = this.extractSection(result.primaryResponse, 'RISKS')
      .split('\n')
      .filter(Boolean);
    const recommendations = this.extractSection(
      result.primaryResponse,
      'RECOMMENDATIONS'
    )
      .split('\n')
      .filter(Boolean);

    const analysisResult: AnalysisResult = {
      analysisId: `analysis-${Date.now()}`,
      summary,
      approved: result.consensus.approved && decision.includes('APPROVE'),
      confidence: result.consensus.confidence,
      recommendations,
      risks,
      timestamp: new Date(),
    };

    // Store analysis in KV for audit trail
    await kv.put(`analysis:${analysisResult.analysisId}`, analysisResult, 86400); // 24h TTL

    console.log(
      `✅ Analysis complete: ${analysisResult.approved ? 'APPROVED' : 'CHANGES REQUESTED'} (confidence: ${analysisResult.confidence.toFixed(2)})`
    );

    return analysisResult;
  }

  /**
   * Auto-resolve an issue or bug
   */
  async autoResolve(issue: {
    title: string;
    description: string;
    context?: string;
  }): Promise<AutoResolveResult> {
    console.log('🤖 Autonomous Agent: Auto-resolving issue...');

    const prompt = `You are an autonomous coding agent. Solve this issue:

ISSUE: ${issue.title}

DESCRIPTION:
${issue.description}

${issue.context ? `CONTEXT:\n${issue.context}` : ''}

Provide:
1. Root cause analysis
2. Complete solution with code
3. Testing strategy
4. Deployment considerations

Generate production-ready code that fixes this issue.`;

    const solution = await aiOrchestrator.generateSolution(prompt);

    // Analyze the solution quality
    const qualityCheck = await aiOrchestrator.analyzeWithAllModels(
      `Review this solution for correctness and quality:\n\n${solution}\n\nProvide APPROVE or REQUEST_CHANGES.`
    );

    const result: AutoResolveResult = {
      success: qualityCheck.consensus.approved,
      solution,
      confidence: qualityCheck.consensus.confidence,
      appliedChanges: this.extractCodeBlocks(solution),
    };

    console.log(
      `✅ Auto-resolve ${result.success ? 'succeeded' : 'needs review'} (confidence: ${result.confidence.toFixed(2)})`
    );

    return result;
  }

  /**
   * Auto-merge with safety checks
   */
  async autoMerge(prData: {
    number: number;
    analysis: AnalysisResult;
  }): Promise<{ merged: boolean; reason: string }> {
    console.log(`🤖 Autonomous Agent: Evaluating PR #${prData.number} for auto-merge...`);

    // Safety checks
    const safetyChecks = [
      {
        name: 'Consensus approval',
        passed: prData.analysis.approved,
      },
      {
        name: 'High confidence',
        passed: prData.analysis.confidence >= 0.85,
      },
      {
        name: 'No critical risks',
        passed: !prData.analysis.risks.some((r) =>
          /critical|security|breaking/i.test(r)
        ),
      },
    ];

    const allChecksPassed = safetyChecks.every((c) => c.passed);

    if (!allChecksPassed) {
      const failedChecks = safetyChecks.filter((c) => !c.passed);
      return {
        merged: false,
        reason: `Failed safety checks: ${failedChecks.map((c) => c.name).join(', ')}`,
      };
    }

    // In production, this would trigger actual merge via GitHub API
    console.log(`✅ PR #${prData.number} approved for auto-merge`);

    return {
      merged: true,
      reason: 'All safety checks passed with consensus approval',
    };
  }

  /**
   * Self-improvement: Learn from feedback
   */
  async learn(feedback: {
    analysisId: string;
    wasCorrect: boolean;
    actualOutcome: string;
    notes?: string;
  }): Promise<void> {
    console.log('🧠 Autonomous Agent: Learning from feedback...');

    // Store feedback for continuous improvement
    await kv.put(`feedback:${feedback.analysisId}`, feedback, 2592000); // 30 day TTL

    // In a full implementation, this would:
    // 1. Update model weights/prompts
    // 2. Adjust confidence thresholds
    // 3. Improve decision-making algorithms
    // 4. Generate training data for fine-tuning

    console.log(`✅ Feedback recorded for analysis ${feedback.analysisId}`);
  }

  /**
   * Extract section from AI response
   */
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}:\\s*(.+?)(?=\\n[A-Z]+:|$)`, 'is');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract code blocks from markdown
   */
  private extractCodeBlocks(text: string): string[] {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const matches = text.match(codeBlockRegex);
    return matches ? matches.map((m) => m.replace(/```\w*\n?/g, '').trim()) : [];
  }

  /**
   * Health check: Verify all AI services are operational
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, boolean>;
  }> {
    const testPrompt = 'Respond with OK if you can read this.';

    const results = await aiOrchestrator.analyzeWithAllModels(testPrompt);

    const services = results.responses.reduce(
      (acc, r) => {
        acc[r.model] = !r.error && r.response.length > 0;
        return acc;
      },
      {} as Record<string, boolean>
    );

    const healthyCount = Object.values(services).filter(Boolean).length;
    const totalCount = Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'down';
    if (healthyCount === totalCount) {
      status = 'healthy';
    } else if (healthyCount >= 2) {
      status = 'degraded';
    } else {
      status = 'down';
    }

    return { status, services };
  }
}

// Export singleton
export const agent = new AutonomousAgent();
