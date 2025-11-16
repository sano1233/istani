/**
 * Unified Secrets Manager for Istani Project
 *
 * This module provides centralized management of all API keys and secrets
 * used across the project, supporting both local development (.env files)
 * and GitHub environment variables for CI/CD.
 *
 * Supported Services:
 * - AI Services: Gemini, Anthropic Claude, OpenAI, Qwen
 * - Deployment: Vercel, Supabase
 * - GitHub: GitHub Token for automation
 * - Other: Additional AI coding helpers
 */

require('dotenv').config();

/**
 * Secret definitions with validation rules
 */
const SECRET_DEFINITIONS = {
  // AI Services
  GEMINI_API_KEY: {
    required: false,
    env: ['GEMINI_API_KEY'],
    description: 'Google Gemini AI API key for code analysis and generation',
    validateFormat: (val) => val && val.length > 20,
  },
  ANTHROPIC_API_KEY: {
    required: false,
    env: ['ANTHROPIC_API_KEY'],
    description: 'Anthropic Claude API key for code analysis',
    validateFormat: (val) => val && val.startsWith('sk-ant-'),
  },
  OPENAI_API_KEY: {
    required: false,
    env: ['OPENAI_API_KEY', 'open_ai_api_key'],
    description: 'OpenAI API key for GPT models',
    validateFormat: (val) => val && (val.startsWith('sk-') || val.startsWith('sk-proj-')),
  },
  QWEN_API_KEY: {
    required: false,
    env: ['QWEN_API_KEY', 'QWEN'],
    description: 'Alibaba Qwen AI API key',
    validateFormat: (val) => val && val.length > 20,
  },

  // Deployment & Infrastructure
  VERCEL_TOKEN: {
    required: false,
    env: ['VERCEL_TOKEN', 'VERCEL_API_TOKEN'],
    description: 'Vercel deployment token',
    validateFormat: (val) => val && val.length > 20,
  },
  VERCEL_ORG_ID: {
    required: false,
    env: ['VERCEL_ORG_ID'],
    description: 'Vercel organization ID',
    validateFormat: (val) => val && val.length > 10,
  },
  VERCEL_PROJECT_ID: {
    required: false,
    env: ['VERCEL_PROJECT_ID'],
    description: 'Vercel project ID',
    validateFormat: (val) => val && val.length > 10,
  },

  // Supabase
  SUPABASE_URL: {
    required: false,
    env: ['SUPABASE_URL'],
    description: 'Supabase project URL',
    validateFormat: (val) => val && val.includes('supabase.co'),
  },
  SUPABASE_ANON_KEY: {
    required: false,
    env: ['SUPABASE_ANON_KEY', 'SUPABASE_KEY'],
    description: 'Supabase anonymous/public key',
    validateFormat: (val) => val && val.length > 100,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: false,
    env: ['SUPABASE_SERVICE_ROLE_KEY'],
    description: 'Supabase service role key (admin)',
    validateFormat: (val) => val && val.length > 100,
  },

  // GitHub
  GITHUB_TOKEN: {
    required: false,
    env: ['GITHUB_TOKEN', 'GH_TOKEN'],
    description: 'GitHub personal access token or Actions token',
    validateFormat: (val) => val && (val.startsWith('ghp_') || val.startsWith('ghs_')),
  },

  // Additional AI Services (unlimited API helpers)
  DEEPSEEK_API_KEY: {
    required: false,
    env: ['DEEPSEEK_API_KEY'],
    description: 'DeepSeek AI API key',
    validateFormat: (val) => val && val.length > 20,
  },
  COHERE_API_KEY: {
    required: false,
    env: ['COHERE_API_KEY'],
    description: 'Cohere AI API key',
    validateFormat: (val) => val && val.length > 20,
  },
  HUGGINGFACE_API_KEY: {
    required: false,
    env: ['HUGGINGFACE_API_KEY', 'HF_TOKEN'],
    description: 'Hugging Face API key',
    validateFormat: (val) => val && val.startsWith('hf_'),
  },
};

/**
 * Load a secret with fallback to multiple environment variable names
 */
function loadSecret(secretDef) {
  for (const envName of secretDef.env) {
    const value = process.env[envName];
    if (value) {
      return value;
    }
  }
  return null;
}

/**
 * Validate secret format
 */
function validateSecret(secretKey, value, secretDef) {
  if (!value) {
    return secretDef.required
      ? {
          valid: false,
          error: `${secretKey} is required but not set`,
        }
      : { valid: true };
  }

  if (secretDef.validateFormat && !secretDef.validateFormat(value)) {
    return {
      valid: false,
      error: `${secretKey} has invalid format`,
    };
  }

  return { valid: true };
}

/**
 * Load all secrets with validation
 */
function loadSecrets() {
  const secrets = {};
  const errors = [];
  const warnings = [];

  for (const [secretKey, secretDef] of Object.entries(SECRET_DEFINITIONS)) {
    const value = loadSecret(secretDef);
    secrets[secretKey] = value;

    const validation = validateSecret(secretKey, value, secretDef);
    if (!validation.valid) {
      if (secretDef.required) {
        errors.push(validation.error);
      } else {
        warnings.push(`Optional: ${secretDef.description} not configured`);
      }
    }
  }

  return { secrets, errors, warnings };
}

/**
 * Get secret health status
 */
function getSecretsHealth() {
  const { secrets, errors, warnings } = loadSecrets();
  const configured = Object.entries(secrets).filter(([_, v]) => v !== null);

  return {
    total: Object.keys(SECRET_DEFINITIONS).length,
    configured: configured.length,
    missing: Object.keys(SECRET_DEFINITIONS).length - configured.length,
    errors: errors.length,
    warnings: warnings.length,
    healthy: errors.length === 0,
    details: {
      configured: configured.map(([key]) => key),
      missing: Object.entries(secrets)
        .filter(([_, v]) => v === null)
        .map(([key]) => key),
      errors,
      warnings,
    },
  };
}

/**
 * Main secrets object - lazy loaded
 */
let _cachedSecrets = null;

function getSecrets() {
  if (!_cachedSecrets) {
    const { secrets, errors } = loadSecrets();

    // Only throw if there are actual errors (required secrets missing)
    if (errors.length > 0) {
      throw new Error(
        `Secret validation failed:\n${errors.join('\n')}\n\n` +
          `Please configure required secrets in your .env file or GitHub environment.`,
      );
    }

    _cachedSecrets = secrets;
  }

  return _cachedSecrets;
}

/**
 * Get a specific secret with optional fallback
 */
function getSecret(key, fallback = null) {
  const secrets = getSecrets();
  return secrets[key] || fallback;
}

/**
 * Check if a specific secret is configured
 */
function hasSecret(key) {
  const secrets = getSecrets();
  return secrets[key] !== null && secrets[key] !== undefined;
}

/**
 * Export secrets and utility functions
 */
module.exports = {
  // Get all secrets
  getSecrets,

  // Get specific secret
  getSecret,

  // Check if secret exists
  hasSecret,

  // Health check
  getSecretsHealth,

  // Secret definitions for documentation
  SECRET_DEFINITIONS,

  // Individual secret getters (convenience)
  get GEMINI_API_KEY() {
    return getSecret('GEMINI_API_KEY');
  },
  get ANTHROPIC_API_KEY() {
    return getSecret('ANTHROPIC_API_KEY');
  },
  get OPENAI_API_KEY() {
    return getSecret('OPENAI_API_KEY');
  },
  get QWEN_API_KEY() {
    return getSecret('QWEN_API_KEY');
  },
  get VERCEL_TOKEN() {
    return getSecret('VERCEL_TOKEN');
  },
  get VERCEL_ORG_ID() {
    return getSecret('VERCEL_ORG_ID');
  },
  get VERCEL_PROJECT_ID() {
    return getSecret('VERCEL_PROJECT_ID');
  },
  get SUPABASE_URL() {
    return getSecret('SUPABASE_URL');
  },
  get SUPABASE_ANON_KEY() {
    return getSecret('SUPABASE_ANON_KEY');
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return getSecret('SUPABASE_SERVICE_ROLE_KEY');
  },
  get GITHUB_TOKEN() {
    return getSecret('GITHUB_TOKEN');
  },
  get DEEPSEEK_API_KEY() {
    return getSecret('DEEPSEEK_API_KEY');
  },
  get COHERE_API_KEY() {
    return getSecret('COHERE_API_KEY');
  },
  get HUGGINGFACE_API_KEY() {
    return getSecret('HUGGINGFACE_API_KEY');
  },
};
