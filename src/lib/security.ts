const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+instructions?/i,
  /disregard\s+(previous|above|all)\s+(instructions?|directions?)/i,
  /forget\s+(everything|all)\s+(you|your)\s+(were|are)\s+told/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(if|though)/i,
  /pretend\s+(you|to)\s+are/i,
  /roleplay\s+as/i,
  /simulate\s+(being|a)/i,
  /override\s+your/i,
];

const SUSPICIOUS_CONTENT_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[^>]*>/gi,
  /eval\s*\(/gi,
  /document\./gi,
  /window\./gi,
];

const MAX_INPUT_LENGTH = 4000;
const MAX_MESSAGE_LENGTH = 2000;

export interface SecurityValidation {
  isValid: boolean;
  reason?: string;
  sanitizedInput?: string;
}

export function sanitizeInput(input: string): string {
  let sanitized = input.trim();

  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/[^\x20-\x7E\n\r\t]/g, '');
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

export function detectPromptInjection(input: string): boolean {
  const lowerInput = input.toLowerCase();

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(lowerInput)) {
      return true;
    }
  }

  for (const pattern of SUSPICIOUS_CONTENT_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }

  const suspiciousTokens = [
    'openai',
    'anthropic',
    'assistant:',
    'system:',
    'user:',
    '<|endoftext|>',
    '###',
    '```system',
  ];

  for (const token of suspiciousTokens) {
    if (lowerInput.includes(token)) {
      return true;
    }
  }

  return false;
}

export function validateInput(input: string): SecurityValidation {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      reason: 'Invalid input type'
    };
  }

  if (input.length > MAX_INPUT_LENGTH) {
    return {
      isValid: false,
      reason: 'Input exceeds maximum length'
    };
  }

  const sanitized = sanitizeInput(input);

  if (sanitized.length === 0) {
    return {
      isValid: false,
      reason: 'Input is empty after sanitization'
    };
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      reason: 'Message too long'
    };
  }

  if (detectPromptInjection(sanitized)) {
    return {
      isValid: false,
      reason: 'Potentially malicious content detected'
    };
  }

  return {
    isValid: true,
    sanitizedInput: sanitized
  };
}

export function validateMessages(messages: any[]): SecurityValidation {
  if (!Array.isArray(messages)) {
    return {
      isValid: false,
      reason: 'Messages must be an array'
    };
  }

  if (messages.length === 0) {
    return {
      isValid: false,
      reason: 'No messages provided'
    };
  }

  if (messages.length > 50) {
    return {
      isValid: false,
      reason: 'Too many messages in conversation'
    };
  }

  for (const message of messages) {
    if (!message.content || typeof message.content !== 'string') {
      return {
        isValid: false,
        reason: 'Invalid message format'
      };
    }

    const validation = validateInput(message.content);
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true };
}
