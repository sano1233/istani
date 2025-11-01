import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { secureAI } from '@/lib/ai-security/defense';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIModelResponse {
  model: 'claude' | 'gemini' | 'openai' | 'qwen';
  response: string;
  confidence?: number;
  approved?: boolean;
  error?: string;
  processingTime: number;
}

export interface MultiAIResult {
  responses: AIModelResponse[];
  consensus: {
    approved: boolean;
    approvalCount: number;
    totalResponses: number;
    confidence: number;
  };
  primaryResponse: string;
}

/**
 * Multi-AI Orchestrator for autonomous decision-making
 * Runs multiple AI models in parallel and achieves consensus
 */
export class MultiAIOrchestrator {
  /**
   * Analyze with all AI models in parallel
   */
  async analyzeWithAllModels(prompt: string): Promise<MultiAIResult> {
    const startTime = Date.now();

    // Run all models in parallel for speed
    const [claudeResult, geminiResult, openaiResult, qwenResult] =
      await Promise.allSettled([
        this.analyzeWithClaude(prompt),
        this.analyzeWithGemini(prompt),
        this.analyzeWithOpenAI(prompt),
        this.analyzeWithQwen(prompt),
      ]);

    const responses: AIModelResponse[] = [
      claudeResult.status === 'fulfilled' ? claudeResult.value : null,
      geminiResult.status === 'fulfilled' ? geminiResult.value : null,
      openaiResult.status === 'fulfilled' ? openaiResult.value : null,
      qwenResult.status === 'fulfilled' ? qwenResult.value : null,
    ].filter(Boolean) as AIModelResponse[];

    // Calculate consensus
    const approvals = responses.filter((r) => r.approved);
    const approvalCount = approvals.length;
    const totalResponses = responses.length;
    const avgConfidence =
      responses.reduce((sum, r) => sum + (r.confidence || 0), 0) /
      totalResponses;

    // Consensus requires 2+ approvals
    const consensusApproved = approvalCount >= 2;

    // Use highest confidence response as primary
    const primaryResponse =
      responses.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0]
        ?.response || 'No response available';

    console.log(
      `Multi-AI analysis completed in ${Date.now() - startTime}ms: ${approvalCount}/${totalResponses} approved`
    );

    return {
      responses,
      consensus: {
        approved: consensusApproved,
        approvalCount,
        totalResponses,
        confidence: avgConfidence,
      },
      primaryResponse,
    };
  }

  /**
   * Analyze with Claude (Anthropic)
   */
  private async analyzeWithClaude(prompt: string): Promise<AIModelResponse> {
    const startTime = Date.now();

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const approved = /approve|lgtm|looks good/i.test(text);

      return {
        model: 'claude',
        response: text,
        approved,
        confidence: 0.95, // Claude is highly reliable
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('Claude analysis error:', error);
      return {
        model: 'claude',
        response: '',
        error: error.message,
        approved: false,
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze with Gemini (Google)
   */
  private async analyzeWithGemini(prompt: string): Promise<AIModelResponse> {
    const startTime = Date.now();

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const approved = /approve|lgtm|looks good/i.test(text);

      return {
        model: 'gemini',
        response: text,
        approved,
        confidence: 0.9,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('Gemini analysis error:', error);
      return {
        model: 'gemini',
        response: '',
        error: error.message,
        approved: false,
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze with OpenAI (with security and confidence scoring)
   */
  private async analyzeWithOpenAI(prompt: string): Promise<AIModelResponse> {
    const startTime = Date.now();

    try {
      const result = await secureAI.processQuery(prompt);
      const text = result.answer || '';
      const approved = /approve|lgtm|looks good/i.test(text);

      return {
        model: 'openai',
        response: text,
        approved,
        confidence: result.confidence,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('OpenAI analysis error:', error);
      return {
        model: 'openai',
        response: '',
        error: error.message,
        approved: false,
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Analyze with Qwen (Alibaba)
   */
  private async analyzeWithQwen(prompt: string): Promise<AIModelResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'qwen-max',
            input: { prompt },
            parameters: {
              max_tokens: 2000,
              temperature: 0.7,
            },
          }),
        }
      );

      const data = await response.json();
      const text = data.output?.text || '';
      const approved = /approve|lgtm|looks good/i.test(text);

      return {
        model: 'qwen',
        response: text,
        approved,
        confidence: 0.85,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('Qwen analysis error:', error);
      return {
        model: 'qwen',
        response: '',
        error: error.message,
        approved: false,
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate code solution with highest confidence model
   */
  async generateSolution(problem: string): Promise<string> {
    // Try OpenAI first (with security)
    const openaiResult = await secureAI.processQuery(
      `Generate a solution for this problem:\n\n${problem}\n\nProvide clean, production-ready code.`
    );

    if (openaiResult.confidence >= 0.99 && openaiResult.answer) {
      return openaiResult.answer;
    }

    // Fallback to Claude
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate a solution for this problem:\n\n${problem}\n\nProvide clean, production-ready code.`,
        },
      ],
    });

    return claudeResponse.content[0].type === 'text'
      ? claudeResponse.content[0].text
      : '';
  }

  /**
   * Auto-resolve conflicts using Gemini
   */
  async resolveConflict(conflictDescription: string, fileContent: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a conflict resolution expert. Resolve this merge conflict:

CONFLICT DESCRIPTION:
${conflictDescription}

FILE CONTENT WITH CONFLICTS:
${fileContent}

Provide the resolved file content without conflict markers.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

// Export singleton
export const aiOrchestrator = new MultiAIOrchestrator();
