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
  // AI Services (Core)
  GEMINI_API_KEY: {
    required: false,
    env: ['GEMINI_API_KEY', 'gemini_api_key'],
    description: 'Google Gemini AI API key for code analysis and generation',
    validateFormat: (val) => val && val.length > 20,
  },
  ANTHROPIC_API_KEY: {
    required: false,
    env: ['ANTHROPIC_API_KEY', 'claude_api_key'],
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
    env: ['QWEN_API_KEY', 'QWEN', 'Qwen_api_key', 'qwen_api_key'],
    description: 'Alibaba Qwen AI API key',
    validateFormat: (val) => val && val.length > 20,
  },
  QWEN3_CODER_API_KEY: {
    required: false,
    env: ['QWEN3_CODER_API_KEY', 'QWEN3_API_KEY', 'Qwen3_coder_api_key'],
    description: 'Qwen 3 Coder API key',
    validateFormat: (val) => val && val.length > 20,
  },
  QWEN_2_5_CODER_32_INSTRUCT_API_KEY: {
    required: false,
    env: [
      'QWEN_2_5_CODER_32_INSTRUCT_API_KEY',
      'QWEN_2_5_CODER_API_KEY',
      'qwen_2.5_coder_32_instruct_api_key',
    ],
    description: 'Qwen 2.5 Coder 32K Instruct API key',
    validateFormat: (val) => val && val.length > 20,
  },
  DEEPSEEK_API_KEY: {
    required: false,
    env: ['DEEPSEEK_API_KEY', 'deep_seek_api_key'],
    description: 'DeepSeek AI API key',
    validateFormat: (val) => val && val.length > 20,
  },
  TNG_TECH_DEEP_SEEK_API_KEY: {
    required: false,
    env: ['TNG_TECH_DEEP_SEEK_API_KEY', 'tng_tech_deep_seek_api_key'],
    description: 'TNG Tech DeepSeek enterprise API key',
    validateFormat: (val) => val && val.length > 20,
  },
  MISTRAL_AI_API_KEY: {
    required: false,
    env: ['MISTRAL_AI_API_KEY', 'mistral_ai_api_key'],
    description: 'Mistral AI production API key',
    validateFormat: (val) => val && val.length > 20,
  },
  MISTRAL_AI_DEV_STRALL_API_KEY: {
    required: false,
    env: ['MISTRAL_AI_DEV_STRALL_API_KEY', 'mistral_ai_dev_strall_api_key'],
    description: 'Mistral AI developer (Strall) API key',
    validateFormat: (val) => val && val.length > 20,
  },
  COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY: {
    required: false,
    env: [
      'COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY',
      'cognitive_computations_dolphin_mistral_api_key',
    ],
    description: 'Cognitive Computations Dolphin (Mistral) API key',
    validateFormat: (val) => val && val.length > 20,
  },
  GLM_4_5_API_KEY: {
    required: false,
    env: ['GLM_4_5_API_KEY', 'GLM_4.5_API_KEY', 'Glm_4.5_api_key'],
    description: 'GLM 4.5 large language model API key',
    validateFormat: (val) => val && val.length > 20,
  },
  GROK_X_API_KEY: {
    required: false,
    env: ['GROK_X_API_KEY', 'grok_x_api_key'],
    description: 'xAI Grok API key',
    validateFormat: (val) => val && val.length > 20,
  },
  X_API_KEY: {
    required: false,
    env: ['X_API_KEY', 'X_api_key', 'TWITTER_API_KEY'],
    description: 'X Platform API key for real-time signals',
    validateFormat: (val) => val && val.length > 15,
  },
  ELEVEN_LABS_API_KEY: {
    required: false,
    env: ['ELEVEN_LABS_API_KEY', 'ELEVENLABS_API_KEY', 'eleven_labs_api_key'],
    description: 'ElevenLabs voice synthesis API key',
    validateFormat: (val) => val && val.length > 20,
  },
  HERMES_LLAMA_API_KEY: {
    required: false,
    env: ['HERMES_LLAMA_API_KEY', 'hermes_llama_api_key'],
    description: 'Hermes Llama API key',
    validateFormat: (val) => val && val.length > 20,
  },
  AGENTICA_API_KEY: {
    required: false,
    env: ['AGENTICA_API_KEY', 'Agentica_api_key', 'agentica_api_key'],
    description: 'Agentica unified automation API key',
    validateFormat: (val) => val && val.length > 20,
  },
  AGENTICA_DEEP_CODER_API_KEY: {
    required: false,
    env: ['AGENTICA_DEEP_CODER_API_KEY', 'agentica_deep_coder_api_key'],
    description: 'Agentica DeepCoder specialized API key',
    validateFormat: (val) => val && val.length > 20,
  },
  CODE_RABBIT_API_KEY: {
    required: false,
    env: ['CODE_RABBIT_API_KEY', 'code_rabbit_api'],
    description: 'CodeRabbit AI reviewer API key',
    validateFormat: (val) => val && val.length > 20,
  },
  MICROSOFT_AI_CODER_API_KEY: {
    required: false,
    env: ['MICROSOFT_AI_CODER_API_KEY', 'microsoft_ai_coder_api_key'],
    description: 'Microsoft AI Coder API key',
    validateFormat: (val) => val && val.length > 20,
  },
  MINIMAX_API_KEY: {
    required: false,
    env: ['MINIMAX_API_KEY', 'Minimax_api_key'],
    description: 'MiniMax AI API key',
    validateFormat: (val) => val && val.length > 20,
  },
  NVIDIA_NEMATRON_NANO_API_KEY: {
    required: false,
    env: ['NVIDIA_NEMATRON_NANO_API_KEY', 'Nvidia_nematron_nano_api_key'],
    description: 'NVIDIA NeMo / Nemotron Nano API key',
    validateFormat: (val) => val && val.length > 20,
  },
  KIMI_DEV_MOONSHOT_API_KEY: {
    required: false,
    env: ['KIMI_DEV_MOONSHOT_API_KEY', 'kimi_dev_moonshot_api_key'],
    description: 'Kimi / Moonshot AI developer API key',
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
    env: ['GITHUB_TOKEN', 'GITHUB_API_KEY', 'github_api_key', 'GH_TOKEN'],
    description: 'GitHub personal access token or Actions token',
    validateFormat: (val) =>
      val &&
      (val.startsWith('ghp_') ||
        val.startsWith('ghs_') ||
        val.startsWith('github_pat_') ||
        val.length > 30),
  },

  // Additional AI Services (legacy helpers)
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
      const canonical = secretDef.env[0];
      if (canonical && envName !== canonical && !process.env[canonical]) {
        process.env[canonical] = value;
      }
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
const exported = {
  getSecrets,
  getSecret,
  hasSecret,
  getSecretsHealth,
  SECRET_DEFINITIONS,
};

for (const secretKey of Object.keys(SECRET_DEFINITIONS)) {
  Object.defineProperty(exported, secretKey, {
    enumerable: true,
    get() {
      return getSecret(secretKey);
    },
  });
}

module.exports = exported;
