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
    gemini: {
      enabled: secrets.hasSecret('GEMINI_API_KEY'),
      apiKey: secrets.GEMINI_API_KEY,
      model: 'gemini-pro',
      maxTokens: 4096
    },
    anthropic: {
      enabled: secrets.hasSecret('ANTHROPIC_API_KEY'),
      apiKey: secrets.ANTHROPIC_API_KEY,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096
    },
    openai: {
      enabled: secrets.hasSecret('OPENAI_API_KEY'),
      apiKey: secrets.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096
    },
    qwen: {
      enabled: secrets.hasSecret('QWEN_API_KEY'),
      apiKey: secrets.QWEN_API_KEY,
      model: 'qwen-max',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    },
    deepseek: {
      enabled: secrets.hasSecret('DEEPSEEK_API_KEY'),
      apiKey: secrets.DEEPSEEK_API_KEY,
      model: 'deepseek-coder',
      endpoint: 'https://api.deepseek.com/v1'
    },
    cohere: {
      enabled: secrets.hasSecret('COHERE_API_KEY'),
      apiKey: secrets.COHERE_API_KEY,
      model: 'command'
    },
    huggingface: {
      enabled: secrets.hasSecret('HUGGINGFACE_API_KEY'),
      apiKey: secrets.HUGGINGFACE_API_KEY
    }
  },

  // Deployment Configuration
  deployment: {
    vercel: {
      enabled: secrets.hasSecret('VERCEL_TOKEN'),
      token: secrets.VERCEL_TOKEN,
      orgId: secrets.VERCEL_ORG_ID,
      projectId: secrets.VERCEL_PROJECT_ID
    },
    supabase: {
      enabled: secrets.hasSecret('SUPABASE_URL') && secrets.hasSecret('SUPABASE_ANON_KEY'),
      url: secrets.SUPABASE_URL,
      anonKey: secrets.SUPABASE_ANON_KEY,
      serviceRoleKey: secrets.SUPABASE_SERVICE_ROLE_KEY
    }
  },

  // GitHub Configuration
  github: {
    enabled: secrets.hasSecret('GITHUB_TOKEN'),
    token: secrets.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPOSITORY || 'sano1233/istani',
    owner: process.env.GITHUB_REPOSITORY_OWNER || 'sano1233'
  },

  // PR Automation Settings
  prAutomation: {
    enabled: true,
    requireConsensus: true,
    consensusThreshold: 0.67, // 2/3 approval
    autoMerge: true,
    autoResolveConflicts: true,
    squashMerge: true
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
        deployment: [
          this.deployment.vercel.enabled,
          this.deployment.supabase.enabled
        ].filter(Boolean).length,
        github: this.github.enabled ? 1 : 0
      },
      details: {
        aiProviders: aiProviders.map(p => p.name),
        enabledServices: enabledServices.map(s => `${s.type}:${s.name}`)
      }
    };
  }
};

module.exports = config;
