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

### AI Services

| Service              | Environment Variable  | Required | Get Key From                             |
| -------------------- | --------------------- | -------- | ---------------------------------------- |
| **Google Gemini**    | `GEMINI_API_KEY`      | No       | https://makersuite.google.com/app/apikey |
| **Anthropic Claude** | `ANTHROPIC_API_KEY`   | No       | https://console.anthropic.com/           |
| **OpenAI**           | `OPENAI_API_KEY`      | No       | https://platform.openai.com/api-keys     |
| **Alibaba Qwen**     | `QWEN_API_KEY`        | No       | https://dashscope.console.aliyun.com/    |
| **DeepSeek**         | `DEEPSEEK_API_KEY`    | No       | https://platform.deepseek.com/           |
| **Cohere**           | `COHERE_API_KEY`      | No       | https://dashboard.cohere.com/            |
| **Hugging Face**     | `HUGGINGFACE_API_KEY` | No       | https://huggingface.co/settings/tokens   |

### Deployment Services

| Service      | Environment Variables                                                | Required | Get From                                        |
| ------------ | -------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| **Vercel**   | `VERCEL_TOKEN`<br>`VERCEL_ORG_ID`<br>`VERCEL_PROJECT_ID`             | No       | https://vercel.com/account/tokens               |
| **Supabase** | `SUPABASE_URL`<br>`SUPABASE_ANON_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY` | No       | https://app.supabase.com/project/_/settings/api |

### GitHub

| Variable       | Required | Description                 |
| -------------- | -------- | --------------------------- |
| `GITHUB_TOKEN` | No\*     | GitHub PAT or Actions token |

\*Automatically provided in GitHub Actions

## 💻 Local Development Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Add Your API Keys

Edit `.env` and add your keys:

```bash
# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
OPENAI_API_KEY=sk-your_key_here
QWEN_API_KEY=your_qwen_key_here

# Deployment (if needed)
VERCEL_TOKEN=your_vercel_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# GitHub (for local automation)
GITHUB_TOKEN=ghp_your_github_token_here
```

### Step 3: Validate Configuration

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
#   Total Secrets: 14
#   Configured: 4
#   Missing: 10
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
# AI Services
GEMINI_API_KEY: [your-key]
ANTHROPIC_API_KEY: [your-key]
OPENAI_API_KEY: [your-key]
QWEN_API_KEY: [your-key]
DEEPSEEK_API_KEY: [your-key]
COHERE_API_KEY: [your-key]
HUGGINGFACE_API_KEY: [your-key]

# Deployment
VERCEL_TOKEN: [your-token]
VERCEL_ORG_ID: [your-org-id]
VERCEL_PROJECT_ID: [your-project-id]
SUPABASE_URL: [your-url]
SUPABASE_ANON_KEY: [your-key]
SUPABASE_SERVICE_ROLE_KEY: [your-key]
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
//   { name: 'gemini', enabled: true, apiKey: '...', model: 'gemini-pro' },
//   { name: 'anthropic', enabled: true, apiKey: '...', model: 'claude-3-5-sonnet-20241022' }
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
//   total: 14,
//   configured: 4,
//   missing: 10,
//   errors: 0,
//   warnings: 10,
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
