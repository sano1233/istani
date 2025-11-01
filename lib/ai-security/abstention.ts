import 'server-only';

export type AbstentionType = 'full' | 'partial' | 'none';

export interface AbstentionResult {
  abstained: boolean;
  type: AbstentionType;
  matchedPattern?: string;
}

/**
 * Detect abstention patterns in AI responses
 * Handles both full and partial uncertainty expressions
 */
export function detectAbstention(response: string): AbstentionResult {
  // Full abstention patterns - clear "I don't know" statements
  const fullPatterns = [
    { regex: /I don't know/i, name: 'explicit_unknown' },
    { regex: /I cannot (answer|provide|determine)/i, name: 'cannot_provide' },
    { regex: /insufficient information/i, name: 'insufficient_info' },
    { regex: /I'm not (sure|certain)/i, name: 'not_sure' },
    { regex: /I do not have (enough|sufficient) (information|data)/i, name: 'no_data' },
  ];

  for (const pattern of fullPatterns) {
    if (pattern.regex.test(response)) {
      return {
        abstained: true,
        type: 'full',
        matchedPattern: pattern.name,
      };
    }
  }

  // Partial abstention patterns - uncertain but attempting answer
  const partialPatterns = [
    { regex: /I'm uncertain/i, name: 'uncertain' },
    { regex: /(might|could|possibly) be/i, name: 'speculative' },
    { regex: /it's difficult to say/i, name: 'difficult' },
    { regex: /(perhaps|maybe|probably)/i, name: 'hedging' },
  ];

  for (const pattern of partialPatterns) {
    if (pattern.regex.test(response)) {
      return {
        abstained: true,
        type: 'partial',
        matchedPattern: pattern.name,
      };
    }
  }

  return { abstained: false, type: 'none' };
}

/**
 * Safe generation with abstention handling
 */
export interface SafeGenerationResult {
  answer: string | null;
  reason: string;
  abstentionType?: AbstentionType;
}

/**
 * Normalize abstention responses for consistent handling
 */
export function normalizeAbstention(
  answer: string | null,
  confidence: number,
  threshold: number
): SafeGenerationResult {
  if (!answer) {
    return { answer: null, reason: 'No response generated' };
  }

  if (confidence < threshold) {
    return {
      answer: null,
      reason: `Low confidence (${confidence.toFixed(3)} < ${threshold})`,
    };
  }

  const abstention = detectAbstention(answer);
  if (abstention.abstained) {
    return {
      answer: null,
      reason: `Model abstained (${abstention.type}: ${abstention.matchedPattern})`,
      abstentionType: abstention.type,
    };
  }

  return { answer, reason: 'Success' };
}
