/**
 * Environment Variable Validation Utility
 * Validates and provides type-safe access to environment variables
 */

export interface EnvironmentConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;

  // Site Configuration
  siteUrl: string;
  nodeEnv: string;

  // Cron Jobs
  cronSecret?: string;

  // External APIs
  githubToken?: string;
  pexelsApiKey?: string;
  unsplashAccessKey?: string;
  openaiApiKey?: string;
  usdaApiKey?: string;

  // Database
  databaseUrl?: string;

  // AI Models
  geminiApiKey?: string;
  anthropicApiKey?: string;

  // ElevenLabs
  elevenLabsAgentId?: string;
  elevenLabsApiKey?: string;
}

export class EnvironmentError extends Error {
  constructor(
    message: string,
    public missingVars: string[] = [],
  ) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates required environment variables
 * @param required - Array of required environment variable names
 * @throws EnvironmentError if any required variables are missing
 */
export function validateRequiredEnvVars(required: string[]): void {
  const missing: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missing.join(', ')}`,
      missing,
    );
  }
}

/**
 * Gets environment configuration with validation
 * @param options - Configuration options
 * @returns Validated environment configuration
 */
export function getEnvironmentConfig(options?: {
  requireOpenAI?: boolean;
  requireCron?: boolean;
}): EnvironmentConfig {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  // Add conditional requirements
  if (options?.requireOpenAI) {
    required.push('OPENAI_API_KEY');
  }

  if (options?.requireCron) {
    required.push('CRON_SECRET');
  }

  validateRequiredEnvVars(required);

  return {
    // Supabase - Required
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Site Configuration
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://istani.org',
    nodeEnv: process.env.NODE_ENV || 'development',

    // Cron Jobs
    cronSecret: process.env.CRON_SECRET,

    // External APIs
    githubToken: process.env.GITHUB_TOKEN,
    pexelsApiKey: process.env.PEXELS_API_KEY,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    usdaApiKey: process.env.USDA_API_KEY,

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // AI Models
    geminiApiKey: process.env.GEMINI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,

    // ElevenLabs
    elevenLabsAgentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  };
}

/**
 * Checks if all required environment variables are set
 * @returns Object with validation results
 */
export function checkEnvironment() {
  const results = {
    valid: true,
    missing: [] as string[],
    configured: [] as string[],
    optional: [] as string[],
  };

  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const optional = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
    USDA_API_KEY: process.env.USDA_API_KEY,
  };

  // Check required variables
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      results.valid = false;
      results.missing.push(key);
    } else {
      results.configured.push(key);
    }
  }

  // Check optional variables
  for (const [key, value] of Object.entries(optional)) {
    if (value) {
      results.configured.push(key);
    } else {
      results.optional.push(key);
    }
  }

  return results;
}

/**
 * Logs environment status (useful for debugging)
 * @param includeValues - Whether to include actual values (NEVER use in production logs)
 */
export function logEnvironmentStatus(includeValues = false) {
  const status = checkEnvironment();

  console.log('Environment Status:');
  console.log('- Valid:', status.valid);
  console.log('- Configured:', status.configured.length);
  console.log('- Missing:', status.missing.length);

  if (status.missing.length > 0) {
    console.warn('Missing required variables:', status.missing);
  }

  if (status.optional.length > 0) {
    console.info('Optional variables not set:', status.optional);
  }

  if (includeValues && process.env.NODE_ENV === 'development') {
    console.log('\nConfigured values (development only):');
    for (const key of status.configured) {
      const value = process.env[key];
      if (value) {
        // Mask sensitive values
        const masked =
          key.includes('KEY') || key.includes('SECRET')
            ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
            : value;
        console.log(`  ${key}: ${masked}`);
      }
    }
  }
}
