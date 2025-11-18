# Unified Secrets Management

This document explains how to configure and use the unified secrets management system for the Istani project.

## 🎯 Overview

All API keys and secrets are now managed through a centralized configuration system that supports:

- **Local Development**: `.env` files
- **GitHub Actions**: GitHub Secrets and Environments
- **Multiple AI Providers**: Gemini, Claude, OpenAI, Qwen, and more
- **Deployment Services**: Vercel, Supabase
- **Validation & Health Checks**: Built-in secret validation

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Supported Services](#supported-services)
3. [Local Development Setup](#local-development-setup)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Configuration Reference](#configuration-reference)
6. [Health Checks](#health-checks)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Local Development

```bash
# Copy the template
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor

# Validate your configuration
node config/health-check.js
```

### 2. GitHub Environment

1. Go to: https://github.com/sano1233/istani/settings/environments
2. Create or select the `automated-development` environment
3. Add all required secrets (see [Supported Services](#supported-services))

## 🔧 Supported Services

### AI Services (Core + Agentic)

| Service                                      | Environment Variable                             | Required | Get Key From                             |
| -------------------------------------------- | ------------------------------------------------ | -------- | ---------------------------------------- |
| **Google Gemini**                            | `GEMINI_API_KEY`                                 | No       | https://makersuite.google.com/app/apikey |
| **Anthropic Claude**                         | `ANTHROPIC_API_KEY`                              | No       | https://console.anthropic.com/           |
| **OpenAI GPT**                               | `OPENAI_API_KEY`                                 | No       | https://platform.openai.com/api-keys     |
| **Alibaba Qwen Max**                         | `QWEN_API_KEY`                                   | No       | https://dashscope.console.aliyun.com/    |
| **Qwen 3 Coder**                             | `QWEN3_CODER_API_KEY`                            | No       | https://dashscope.console.aliyun.com/    |
| **Qwen 2.5 Coder 32K**                       | `QWEN_2_5_CODER_32_INSTRUCT_API_KEY`             | No       | https://dashscope.console.aliyun.com/    |
| **DeepSeek**                                 | `DEEPSEEK_API_KEY`                               | No       | https://platform.deepseek.com/           |
| **TNG Tech DeepSeek (Enterprise)**           | `TNG_TECH_DEEP_SEEK_API_KEY`                     | No       | https://www.deepseek.com/enterprise      |
| **Mistral Production**                       | `MISTRAL_AI_API_KEY`                             | No       | https://console.mistral.ai/              |
| **Mistral Dev / Strall**                     | `MISTRAL_AI_DEV_STRALL_API_KEY`                  | No       | https://console.mistral.ai/              |
| **Cognitive Computations Dolphin (Mistral)** | `COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY` | No       | https://cognitivecomputations.ai/        |
| **GLM 4.5**                                  | `GLM_4_5_API_KEY`                                | No       | https://open.bigmodel.cn/                |
| **Grok (xAI)**                               | `GROK_X_API_KEY`                                 | No       | https://x.ai/                            |
| **X Platform Realtime / Streaming**          | `X_API_KEY`                                      | No       | https://developer.x.com/                 |
| **ElevenLabs Voice**                         | `ELEVEN_LABS_API_KEY`                            | No       | https://elevenlabs.io/                   |
| **Hermes Llama (Nous Research)**             | `HERMES_LLAMA_API_KEY`                           | No       | https://nousresearch.com/hermes          |
| **Agentica Unified Agent**                   | `AGENTICA_API_KEY`                               | No       | https://agentica.ai/                     |
| **Agentica Deep Coder**                      | `AGENTICA_DEEP_CODER_API_KEY`                    | No       | https://agentica.ai/                     |
| **CodeRabbit PR Reviewer**                   | `CODE_RABBIT_API_KEY`                            | No       | https://coderabbit.ai/                   |
| **Kimi / Moonshot**                          | `KIMI_DEV_MOONSHOT_API_KEY`                      | No       | https://platform.moonshot.cn/            |
| **Microsoft AI Coder / Copilot Coder**       | `MICROSOFT_AI_CODER_API_KEY`                     | No       | https://aka.ms/copilot-coder             |
| **MiniMax**                                  | `MINIMAX_API_KEY`                                | No       | https://www.minimaxi.com/                |
| **NVIDIA Nemotron / NeMo**                   | `NVIDIA_NEMATRON_NANO_API_KEY`                   | No       | https://build.nvidia.com/                |
| **Cohere**                                   | `COHERE_API_KEY`                                 | No       | https://dashboard.cohere.com/            |
| **Hugging Face**                             | `HUGGINGFACE_API_KEY`                            | No       | https://huggingface.co/settings/tokens   |

### Deployment Services

| Service      | Environment Variables                                                | Required | Get From                                        |
| ------------ | -------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| **Vercel**   | `VERCEL_TOKEN`<br>`VERCEL_ORG_ID`<br>`VERCEL_PROJECT_ID`             | No       | https://vercel.com/account/tokens               |
| **Supabase** | `SUPABASE_URL`<br>`SUPABASE_ANON_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY` | No       | https://app.supabase.com/project/_/settings/api |

### GitHub

| Variable         | Required | Description                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------------------- |
| `GITHUB_TOKEN`   | No\*     | Primary GitHub PAT or Actions token used for CLI operations                  |
| `GITHUB_API_KEY` | No       | Alias that mirrors `GITHUB_TOKEN` for Cursor/Vercel environments and scripts |

\*Automatically provided in GitHub Actions (exposed to jobs as `GITHUB_TOKEN` and `GH_TOKEN`)

## 💻 Local Development Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Add Your API Keys

Edit `.env` and add your keys:

```bash
# Core AI Services
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
OPENAI_API_KEY=sk-your_key_here
QWEN_API_KEY=your_qwen_key_here
QWEN3_CODER_API_KEY=your_qwen3_coder_key
QWEN_2_5_CODER_32_INSTRUCT_API_KEY=your_qwen2_5_coder_key
DEEPSEEK_API_KEY=your_deepseek_key
TNG_TECH_DEEP_SEEK_API_KEY=your_tng_deep_seek_key
MISTRAL_AI_API_KEY=your_mistral_key
MISTRAL_AI_DEV_STRALL_API_KEY=your_mistral_dev_strall_key
COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY=your_dolphin_key
GLM_4_5_API_KEY=your_glm_key
GROK_X_API_KEY=your_grok_x_key
X_API_KEY=your_x_platform_key
ELEVEN_LABS_API_KEY=your_eleven_labs_key
HERMES_LLAMA_API_KEY=your_hermes_llama_key

# Agentic / Coding Partners
AGENTICA_API_KEY=your_agentica_key
AGENTICA_DEEP_CODER_API_KEY=your_agentica_deep_coder_key
CODE_RABBIT_API_KEY=your_code_rabbit_key
KIMI_DEV_MOONSHOT_API_KEY=your_kimi_key
MICROSOFT_AI_CODER_API_KEY=your_microsoft_ai_coder_key
MINIMAX_API_KEY=your_minimax_key
NVIDIA_NEMATRON_NANO_API_KEY=your_nemotron_key
COHERE_API_KEY=your_cohere_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Deployment (if needed)
VERCEL_TOKEN=your_vercel_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# GitHub (for local automation + Cursor)
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_API_KEY=duplicate_or_alias_of_github_token
```

### Step 3: Mirror Secrets in Cursor

Cursor stores secrets per-project. To keep local AI runs consistent with GitHub/Vercel:

1. Open the Command Palette in Cursor (`Cmd/Ctrl` + `Shift` + `P`).
2. Choose **“Cursor: Manage Project Secrets”** (or update `.cursor/secrets` if you commit settings).
3. Add every variable from the lists above, especially the new agentic keys (`AGENTICA_*`, `CODE_RABBIT_API_KEY`, `X_API_KEY`, etc.).
4. Restart the Cursor workspace so Node processes (and `config/secrets`) can hydrate the canonical uppercase names.

### Step 4: Validate Configuration

```bash
# Run health check
node config/health-check.js

# Expected output:
# ══════════════════════════════════════════════════════════════════════
#   ISTANI PROJECT - SECRETS HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════
#
# ▸ Environment
# ────────────────────────────────────────────────────────────────────
#   NODE_ENV: development
#
# ▸ Secrets Status
# ────────────────────────────────────────────────────────────────────
#   Total Secrets: 32
#   Configured: 6
#   Missing: 26
#   ✓ All required secrets are configured
```

## 🔐 GitHub Actions Setup

### Using GitHub Environment (Recommended)

The GitHub Actions workflow is configured to use the `automated-development` environment for all secrets.

#### Step 1: Create Environment

1. Navigate to: https://github.com/sano1233/istani/settings/environments
2. Click "New environment"
3. Name: `automated-development`
4. Click "Configure environment"

#### Step 2: Add Secrets to Environment

Add all your API keys as environment secrets:

```yaml
# Core LLMs
GEMINI_API_KEY: [your-key]
ANTHROPIC_API_KEY: [your-key]
OPENAI_API_KEY: [your-key]
QWEN_API_KEY: [your-key]
QWEN3_CODER_API_KEY: [your-key]
QWEN_2_5_CODER_32_INSTRUCT_API_KEY: [your-key]
DEEPSEEK_API_KEY: [your-key]
TNG_TECH_DEEP_SEEK_API_KEY: [your-key]
MISTRAL_AI_API_KEY: [your-key]
MISTRAL_AI_DEV_STRALL_API_KEY: [your-key]
COGNITIVE_COMPUTATIONS_DOLPHIN_MISTRAL_API_KEY: [your-key]
GLM_4_5_API_KEY: [your-key]
GROK_X_API_KEY: [your-key]
X_API_KEY: [your-key]

# Agentic / Tooling
ELEVEN_LABS_API_KEY: [your-key]
HERMES_LLAMA_API_KEY: [your-key]
AGENTICA_API_KEY: [your-key]
AGENTICA_DEEP_CODER_API_KEY: [your-key]
CODE_RABBIT_API_KEY: [your-key]
KIMI_DEV_MOONSHOT_API_KEY: [your-key]
MICROSOFT_AI_CODER_API_KEY: [your-key]
MINIMAX_API_KEY: [your-key]
NVIDIA_NEMATRON_NANO_API_KEY: [your-key]
COHERE_API_KEY: [your-key]
HUGGINGFACE_API_KEY: [your-key]

# Deployment
VERCEL_TOKEN: [your-token]
VERCEL_ORG_ID: [your-org-id]
VERCEL_PROJECT_ID: [your-project-id]
SUPABASE_URL: [your-url]
SUPABASE_ANON_KEY: [your-key]
SUPABASE_SERVICE_ROLE_KEY: [your-key]

# GitHub / Automation
GITHUB_TOKEN: [your-token]
GITHUB_API_KEY: [same-as-github-token]
```

#### Step 3: Workflow Configuration

The workflow (`.github/workflows/ai-brain.yml`) automatically:

1. Loads all secrets from the `automated-development` environment
2. Runs health checks to validate configuration
3. Executes AI-powered PR analysis with all available providers
4. Auto-merges based on consensus

```yaml
jobs:
  analyze:
    runs-on: ubuntu-latest
    environment: automated-development # ← Uses unified environment
    steps:
      # ... workflow steps with all secrets available
```

## 🚢 Vercel & Hosting Environments

Vercel (and any other hosting target) should mirror the exact same variable names:

1. Navigate to **Vercel → Your Project → Settings → Environment Variables**.
2. Paste each key from `.env.example` (or run `vercel env pull .env.vercel` to sync and review).
3. Set the values in **Development**, **Preview**, and **Production** scopes so the unified agent behaves the same everywhere.
4. Re-run `setup-secrets.sh` locally after any change to ensure `.env.local` stays aligned with Vercel/GitHub/Cursor.

## 📚 Configuration Reference

### Using Unified Config in Code

```javascript
// Import unified config
const config = require('./config');

// Check if a service is enabled
if (config.ai.gemini.enabled) {
  // Use Gemini API
  const apiKey = config.ai.gemini.apiKey;
  const model = config.ai.gemini.model;
}

// Get all enabled AI providers
const providers = config.getAIProviders();
console.log(providers);
// [
//   { name: 'gemini', enabled: true, model: 'gemini-pro' },
//   { name: 'mistral', enabled: true, model: 'mistral-large-latest' },
//   { name: 'agentica', enabled: true, model: 'agentica-unity' }
// ]

// Health check
const health = config.healthCheck();
console.log(health.status); // 'healthy' or 'degraded'
```

### Direct Secret Access

```javascript
const secrets = require('./config/secrets');

// Get specific secret
const geminiKey = secrets.GEMINI_API_KEY;

// Check if secret exists
if (secrets.hasSecret('OPENAI_API_KEY')) {
  // Use OpenAI
}

// Get secrets health
const health = secrets.getSecretsHealth();
console.log(health);
// {
//   total: 32,
//   configured: 6,
//   missing: 26,
//   errors: 0,
//   warnings: 26,
//   healthy: true,
//   details: { ... }
// }
```

## 🏥 Health Checks

### CLI Health Check

```bash
node config/health-check.js
```

Output includes:

- Environment information
- Secrets status (configured, missing, errors)
- Enabled services summary
- AI providers list
- Overall system health

### Programmatic Health Check

```javascript
const config = require('./config');

const health = config.healthCheck();

if (health.status === 'healthy') {
  console.log('All systems operational');
  console.log(`AI Providers: ${health.services.ai}`);
  console.log(`Enabled: ${health.details.aiProviders.join(', ')}`);
} else {
  console.log('System running in degraded mode');
  console.log(health.secrets.details.errors);
}
```

## 🛡️ Best Practices

### Security

1. **Never Commit Secrets**
   - The `.env` file is gitignored
   - Always use `.env.example` as a template
   - Never hardcode API keys in source code

2. **Rotate Keys Regularly**
   - Rotate production keys every 90 days
   - Use separate keys for development, staging, production
   - Revoke compromised keys immediately

3. **Least Privilege**
   - Use read-only keys when possible
   - Limit key scopes and permissions
   - Use service-specific keys

4. **Monitor Usage**
   - Track API key usage
   - Set up alerts for anomalies
   - Monitor rate limits and quotas

### Development

1. **Environment-Specific Configs**

   ```bash
   # Development
   NODE_ENV=development node your-script.js

   # Production
   NODE_ENV=production node your-script.js
   ```

2. **Validate Before Deployment**

   ```bash
   # Always validate before deploying
   node config/health-check.js
   ```

3. **Use Config Abstraction**

   ```javascript
   // ✅ Good - uses config abstraction
   const config = require('./config');
   const apiKey = config.ai.gemini.apiKey;

   // ❌ Bad - direct environment variable access
   const apiKey = process.env.GEMINI_API_KEY;
   ```

## 🔍 Troubleshooting

### "Secret validation failed" Error

**Problem**: Required secret is missing

**Solution**:

1. Check your `.env` file has the required secret
2. Run health check: `node config/health-check.js`
3. Verify secret name matches `.env.example`

### "API not configured" Warning

**Problem**: Optional API provider not configured

**Solution**: This is usually fine. Only configure the AI providers you want to use.

### GitHub Actions: "Secret not found"

**Problem**: Secret not added to GitHub environment

**Solution**:

1. Go to: https://github.com/sano1233/istani/settings/environments/automated-development
2. Add the missing secret
3. Re-run the workflow

### Invalid API Key Format

**Problem**: API key doesn't match expected format

**Solution**:

1. Verify you copied the key correctly (no spaces, complete string)
2. Check the key hasn't expired
3. Regenerate the key from the provider's console

### Config Module Not Found

**Problem**: `Cannot find module '../config'`

**Solution**:

1. Ensure you're running from the project root
2. Verify `config/` directory exists
3. Check Node.js can resolve the path

## 📖 Additional Resources

- [.env.example](./.env.example) - Environment variable template
- [config/secrets.js](./config/secrets.js) - Secrets management module
- [config/index.js](./config/index.js) - Unified configuration
- [config/health-check.js](./config/health-check.js) - Health check CLI
- [.github/workflows/ai-brain.yml](./.github/workflows/ai-brain.yml) - GitHub Actions workflow

## 🆘 Need Help?

If you encounter issues:

1. Run health check: `node config/health-check.js`
2. Check logs for specific error messages
3. Verify API keys are valid and haven't expired
4. Review this documentation
5. Open an issue on GitHub

---

**Last Updated**: 2025-11-10
**Version**: 1.0.0
**Maintained by**: Istani Development Team
