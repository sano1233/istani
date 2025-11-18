/**
 * Unified Configuration Manager for Istani Project
 *
 * Central configuration hub that manages:
 * - Environment-specific settings
 * - API secrets and keys
 * - Service endpoints
 * - Feature flags
 */

const secrets = require('./secrets');

/**
 * Detect current environment
 */
function getEnvironment() {
  return process.env.NODE_ENV || 'development';
}

/**
 * Configuration object
 */
function createProvider(secretKey, extra = {}) {
  return {
    enabled: secrets.hasSecret(secretKey),
    apiKey: secrets[secretKey],
    ...extra,
  };
}

const config = {
  // Environment
  env: getEnvironment(),
  isDevelopment: getEnvironment() === 'development',
  isProduction: getEnvironment() === 'production',
  isTest: getEnvironment() === 'test',

  // Secrets
  secrets: secrets.getSecrets(),

  // AI Services Configuration
  ai: {
    gemini: createProvider('GEMINI_API_KEY', {
      model: 'gemini-pro',
      maxTokens: 4096,
    }),
    anthropic: createProvider('ANTHROPIC_API_KEY', {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
    }),
    openai: createProvider('OPENAI_API_KEY', {
      model: 'gpt-4.1-preview',
      maxTokens: 4096,
    }),
    qwen: createProvider('QWEN_API_KEY', {
      model: 'qwen-max',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    }),
    qwen3Coder: createProvider('QWEN3_CODER_API_KEY', {
      model: 'qwen-3-coder',
    }),
    qwen25Coder32Instruct: createProvider('QWEN_2_5_CODER_32_INSTRUCT_API_KEY', {
      model: 'qwen-2.5-coder-32k-instruct',
    }),
    deepseek: createProvider('DEEPSEEK_API_KEY', {
      model: 'deepseek-coder',
      endpoint: 'https://api.deepseek.com/v1',
    }),
    tngTechDeepSeek: createProvider('TNG_TECH_DEEP_SEEK_API_KEY', {
      model: 'deepseek-enterprise',
    }),
    mistral: createProvider('MISTRAL_AI_API_KEY', {
      model: 'mistral-large-latest',
      endpoint: 'https://api.mistral.ai/v1',
    }),
    mistralDevStrall: createProvider('MISTRAL_AI_DEV_STRALL_API_KEY', {
      model: 'mistral-small-latest',
    }),
    cognitiveComputationsDolphin: createProvider('COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY', {
      model: 'dolphin-mistral',
    }),
    glm45: createProvider('GLM_4_5_API_KEY', {
      model: 'glm-4-0520',
    }),
    grokX: createProvider('GROK_X_API_KEY', {
      model: 'grok-beta',
    }),
    xPlatform: createProvider('X_API_KEY', {
      model: 'xai-realtime',
    }),
    elevenLabs: createProvider('ELEVEN_LABS_API_KEY', {
      voiceModel: 'eleven_multilingual_v2',
    }),
    hermesLlama: createProvider('HERMES_LLAMA_API_KEY', {
      model: 'hermes-llama3-8b',
    }),
    agentica: createProvider('AGENTICA_API_KEY', {
      model: 'agentica-unity',
      endpoint: 'https://api.agentica.ai/v1',
    }),
    agenticaDeepCoder: createProvider('AGENTICA_DEEP_CODER_API_KEY', {
      model: 'agentica-deep-coder',
    }),
    codeRabbit: createProvider('CODE_RABBIT_API_KEY', {
      model: 'code-rabbit-pr-reviewer',
    }),
    kimiMoonshot: createProvider('KIMI_DEV_MOONSHOT_API_KEY', {
      model: 'moonshot-v1-32k',
    }),
    microsoftAiCoder: createProvider('MICROSOFT_AI_CODER_API_KEY', {
      model: 'copilot-coder',
    }),
    minimax: createProvider('MINIMAX_API_KEY', {
      model: 'abab6.5-chat',
    }),
    nvidiaNematronNano: createProvider('NVIDIA_NEMATRON_NANO_API_KEY', {
      model: 'nemotron-4.5-nano-instruct',
    }),
    cohere: createProvider('COHERE_API_KEY', {
      model: 'command',
    }),
    huggingface: createProvider('HUGGINGFACE_API_KEY'),
  },

  // Deployment Configuration
  deployment: {
    vercel: {
      enabled: secrets.hasSecret('VERCEL_TOKEN'),
      token: secrets.VERCEL_TOKEN,
      orgId: secrets.VERCEL_ORG_ID,
      projectId: secrets.VERCEL_PROJECT_ID,
    },
    supabase: {
      enabled: secrets.hasSecret('SUPABASE_URL') && secrets.hasSecret('SUPABASE_ANON_KEY'),
      url: secrets.SUPABASE_URL,
      anonKey: secrets.SUPABASE_ANON_KEY,
      serviceRoleKey: secrets.SUPABASE_SERVICE_ROLE_KEY,
    },
  },

  // GitHub Configuration
  github: {
    enabled: secrets.hasSecret('GITHUB_TOKEN'),
    token: secrets.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPOSITORY || 'sano1233/istani',
    owner: process.env.GITHUB_REPOSITORY_OWNER || 'sano1233',
  },

  // PR Automation Settings
  prAutomation: {
    enabled: true,
    requireConsensus: true,
    consensusThreshold: 0.67, // 2/3 approval
    autoMerge: true,
    autoResolveConflicts: true,
    squashMerge: true,
  },

  // Utility Functions
  getAIProviders() {
    return Object.entries(this.ai)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({ name, ...config }));
  },

  getEnabledServices() {
    const services = [];

    // AI Services
    Object.entries(this.ai).forEach(([name, config]) => {
      if (config.enabled) services.push({ type: 'ai', name, config });
    });

    // Deployment
    if (this.deployment.vercel.enabled) {
      services.push({ type: 'deployment', name: 'vercel', config: this.deployment.vercel });
    }
    if (this.deployment.supabase.enabled) {
      services.push({ type: 'deployment', name: 'supabase', config: this.deployment.supabase });
    }

    // GitHub
    if (this.github.enabled) {
      services.push({ type: 'github', name: 'github', config: this.github });
    }

    return services;
  },

  healthCheck() {
    const secretsHealth = secrets.getSecretsHealth();
    const aiProviders = this.getAIProviders();
    const enabledServices = this.getEnabledServices();

    return {
      status: secretsHealth.healthy ? 'healthy' : 'degraded',
      environment: this.env,
      secrets: secretsHealth,
      services: {
        total: enabledServices.length,
        ai: aiProviders.length,
        deployment: [this.deployment.vercel.enabled, this.deployment.supabase.enabled].filter(
          Boolean,
        ).length,
        github: this.github.enabled ? 1 : 0,
      },
      details: {
        aiProviders: aiProviders.map((p) => p.name),
        enabledServices: enabledServices.map((s) => `${s.type}:${s.name}`),
      },
    };
  },
};

module.exports = config;
