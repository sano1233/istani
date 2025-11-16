# 🤖 GitHub Copilot & Codex Integration Guide

Complete guide for integrating GitHub Copilot and OpenAI Codex with the ISTANI AI Agent for maximum coding capabilities and automatic error resolution.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Multi-Model AI System](#multi-model-ai-system)
- [Automatic Error Resolution](#automatic-error-resolution)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The ISTANI Enhanced AI Agent uses **three powerful AI models** working together:

1. **Claude AI (Anthropic)** - Primary code review and analysis
2. **GitHub Copilot** - Smart code suggestions and completions
3. **OpenAI Codex** - Advanced error detection and auto-fixing

### Benefits of Multi-Model Approach

- **Higher Accuracy** - Cross-validation between models
- **Better Error Detection** - Each model catches different issues
- **Automatic Fixes** - AI-powered error resolution
- **Enhanced Suggestions** - Multiple perspectives on improvements
- **Increased Confidence** - Consensus-based decisions

---

## Prerequisites

### Required Accounts & API Keys

1. **Anthropic API Key** (Required)
   - Sign up at: https://console.anthropic.com/
   - Free tier available
   - Recommended: Pay-as-you-go ($20/month credit)

2. **OpenAI API Key** (Required for Codex)
   - Sign up at: https://platform.openai.com/
   - Models: GPT-4 Turbo, GPT-4
   - Cost: ~$0.01-0.03 per 1K tokens

3. **GitHub Account** (Required for Copilot)
   - GitHub Copilot for Business (preferred)
   - Or: Personal GitHub account with OpenAI API access

### System Requirements

- Node.js >= 18
- npm or yarn
- Git
- GitHub repository with admin access

---

## Setup Instructions

### Step 1: Get API Keys

#### 1.1 Anthropic API Key

```bash
# Visit https://console.anthropic.com/
# 1. Sign up or log in
# 2. Go to API Keys
# 3. Create new key
# 4. Copy and save: sk-ant-api03-xxx
```

#### 1.2 OpenAI API Key

```bash
# Visit https://platform.openai.com/api-keys
# 1. Sign up or log in
# 2. Create new secret key
# 3. Copy and save: sk-xxx
```

#### 1.3 GitHub Copilot (Optional)

```bash
# Option A: GitHub Copilot for Business
# 1. Enable in organization settings
# 2. Use GitHub token with Copilot access

# Option B: Use OpenAI API directly (fallback)
# No additional setup needed if you have OpenAI key
```

### Step 2: Configure Environment

```bash
cd istani/ai-agent
cp .env.example .env
```

Edit `.env`:

```bash
# ============================================
# REQUIRED: Core AI Models
# ============================================

# Claude AI (Primary model)
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# OpenAI (For Codex and Copilot fallback)
OPENAI_API_KEY=sk-xxx

# GitHub Token (For Copilot API access)
GITHUB_TOKEN=ghp_xxx

# ============================================
# OPTIONAL: Feature Toggles
# ============================================

# Enable/disable specific AI models
CLAUDE_ENABLED=true
COPILOT_ENABLED=true
CODEX_ENABLED=true

# Enable automatic error fixing
AUTO_FIX_ENABLED=true

# ============================================
# OPTIONAL: Model Configuration
# ============================================

# Claude Model
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_MAX_TOKENS=8000

# OpenAI Model (for Codex)
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.2

# ============================================
# Repository Configuration
# ============================================

GITHUB_OWNER=sano1233
GITHUB_REPO=istani
```

### Step 3: Add GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxx
OPENAI_API_KEY=sk-xxx
```

### Step 4: Install Dependencies

```bash
cd ai-agent
npm install
```

### Step 5: Test Integration

```bash
# Test multi-model system
npm run cli config

# Should show:
# ✅ ANTHROPIC_API_KEY: Set
# ✅ OPENAI_API_KEY: Set
# ✅ CLAUDE_ENABLED: true
# ✅ COPILOT_ENABLED: true
# ✅ CODEX_ENABLED: true
```

---

## Multi-Model AI System

### How It Works

```
┌─────────────────────────────────────────────┐
│          Pull Request Opened                │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│     Fetch PR Files & Changes                │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│   Parallel Analysis by All Models:          │
│                                             │
│   ┌───────────┐  ┌──────────┐  ┌────────┐ │
│   │ Claude AI │  │ Copilot  │  │ Codex  │ │
│   └─────┬─────┘  └────┬─────┘  └───┬────┘ │
│         │             │             │      │
│         └─────────┬───┴─────────────┘      │
│                   │                        │
│           ┌───────▼────────┐               │
│           │  Consensus     │               │
│           │  Calculation   │               │
│           └───────┬────────┘               │
└───────────────────┼────────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────────┐
│   Combined Review with:                     │
│   - All issues found                        │
│   - Common issues (high confidence)         │
│   - All suggestions                         │
│   - Consensus approval decision             │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│   Auto-Fix Errors (if enabled)              │
│   - Detect errors with linters              │
│   - Generate fixes with all models          │
│   - Apply best fix                          │
│   - Verify fix works                        │
└─────────────────────────────────────────────┘
```

### Model Responsibilities

| Model | Primary Use | Strengths |
|-------|------------|-----------|
| **Claude AI** | Comprehensive code review | Deep analysis, security, architecture |
| **GitHub Copilot** | Code suggestions | Contextual completions, best practices |
| **OpenAI Codex** | Error fixing | Advanced debugging, auto-fix generation |

### Consensus Algorithm

The agent uses a consensus-based approval system:

- **70% Approval Threshold** - At least 70% of models must approve
- **Common Issues** - Issues found by multiple models are flagged as high priority
- **Confidence Score** - Higher confidence when models agree

Example:

```
Models: 3 (Claude, Copilot, Codex)
Approvals: 2 (Claude ✅, Copilot ✅, Codex ❌)
Confidence: 66.7%
Result: CHANGES REQUESTED (below 70% threshold)
```

---

## Automatic Error Resolution

### How Auto-Fix Works

1. **Error Detection**
   - Run ESLint, TypeScript, and other linters
   - Identify syntax errors, type errors, code quality issues

2. **Fix Generation**
   - Each AI model generates potential fixes
   - Fixes are ranked by confidence

3. **Fix Application**
   - Best fix is applied to the code
   - Changes are committed automatically

4. **Verification**
   - Re-run linters to verify fix works
   - Run build and tests

### Supported Error Types

- ✅ **Linting Errors** - ESLint, Prettier violations
- ✅ **Type Errors** - TypeScript type mismatches
- ✅ **Syntax Errors** - JavaScript/TypeScript syntax issues
- ✅ **Import Errors** - Missing or incorrect imports
- ✅ **Code Quality** - Unused variables, dead code
- ✅ **Best Practices** - Console.log removal, async/await

### Auto-Fix Workflow

Automatically triggered on:
- New PR opened
- New commits pushed
- Comment `/fix` on PR

```yaml
# Triggered by:
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]  # Comment "/fix"
```

---

## Usage Examples

### Example 1: Process PR with Multi-Model Review

```bash
# Command line
cd ai-agent
npm run cli process 123

# Output:
🚀 Enhanced AI Agent processing PR #123
🔍 Enhanced analysis with Claude AI, GitHub Copilot, Codex
📝 Enhanced code review with multi-model consensus
🔧 Detecting and resolving errors automatically
✅ Enhanced processing completed in 45.2s

Results:
  Models Used: 3
  Consensus: 100% (all models agree)
  Approved: ✅ Yes
  Errors Fixed: 5
  Build: ✅ Passed
  Tests: ✅ Passed
```

### Example 2: Auto-Fix Errors

```bash
# Comment on PR:
/fix

# Or manually:
npm run cli autofix 123

# Agent will:
# 1. Detect all errors
# 2. Generate fixes with all models
# 3. Apply best fixes
# 4. Commit changes
# 5. Post comment with summary
```

### Example 3: Multi-Model Code Suggestions

```javascript
// In your code, the agent will suggest:

// Before (detected by all models):
function getData() {
  var data = fetchData();  // ❌ Use const/let
  return data;
}

// After (auto-fixed):
async function getData() {
  const data = await fetchData();  // ✅ Modern async/await
  return data;
}
```

### Example 4: API Usage

```javascript
import EnhancedIstaniAgent from './ai-agent/core/enhanced-agent.mjs';

const agent = new EnhancedIstaniAgent({
  owner: 'sano1233',
  repo: 'istani',
  copilotEnabled: true,
  codexEnabled: true,
  autoFixEnabled: true
});

// Process PR with all models
const result = await agent.processPullRequest(123);

console.log('Models Used:', result.modelsUsed);
console.log('Errors Fixed:', result.errorResolution.fixedErrors);
console.log('Consensus:', result.review.consensus);
```

---

## Troubleshooting

### Issue: "OpenAI API key not set"

**Solution:**
```bash
# Check .env file
cat ai-agent/.env | grep OPENAI

# Add to .env
echo "OPENAI_API_KEY=sk-xxx" >> ai-agent/.env

# Add to GitHub Secrets
gh secret set OPENAI_API_KEY --body "sk-xxx"
```

### Issue: "Copilot API access denied"

**Solutions:**

1. **Use GitHub Copilot for Business:**
   ```bash
   # Requires organization with Copilot enabled
   # Set GITHUB_TOKEN with Copilot permissions
   ```

2. **Fallback to OpenAI:**
   ```bash
   # System automatically falls back to OpenAI API
   # No additional config needed if OPENAI_API_KEY is set
   ```

### Issue: "Rate limit exceeded"

**Solution:**
```bash
# Add rate limiting in .env
AGENT_MAX_PRS_PER_HOUR=20
AGENT_RATE_LIMIT_DELAY_MS=3000

# Or upgrade your API plan
# - Anthropic: Scale tier
# - OpenAI: Tier 2+
```

### Issue: "Auto-fix creates broken code"

**Solution:**
```bash
# Disable auto-fix and review manually
AUTO_FIX_ENABLED=false

# Or adjust confidence threshold
AUTO_FIX_CONFIDENCE_THRESHOLD=0.9
```

---

## Best Practices

### 1. Model Selection

- **Use all 3 models** for critical code reviews
- **Claude only** for quick reviews (faster, cheaper)
- **Claude + Codex** for auto-fixing (best accuracy)

### 2. Cost Optimization

```bash
# Estimated costs per PR:
# - Claude: $0.05-0.15
# - OpenAI: $0.10-0.30
# - Total: ~$0.15-0.45 per PR

# Reduce costs:
# - Limit file count
# - Use selective models
# - Cache responses
```

### 3. Security

```bash
# Never commit API keys
echo "*.env" >> .gitignore

# Use GitHub Secrets for CI/CD
gh secret set ANTHROPIC_API_KEY
gh secret set OPENAI_API_KEY

# Rotate keys regularly
# - Every 90 days minimum
# - Immediately if exposed
```

### 4. Performance

```bash
# Parallel processing
# - All models run concurrently
# - Typical review: 30-60 seconds

# Optimization tips:
# - Limit files to 20 per PR
# - Use streaming responses
# - Enable caching
```

---

## Advanced Configuration

### Custom Model Prompts

Edit `ai-agent/core/multi-model-ai.mjs`:

```javascript
buildClaudePrompt(code, context) {
  return `Your custom prompt for Claude...`;
}

buildCopilotPrompt(code, context) {
  return `Your custom prompt for Copilot...`;
}

buildCodexPrompt(code, context) {
  return `Your custom prompt for Codex...`;
}
```

### Consensus Threshold

```javascript
// In enhanced-agent.mjs
calculateOverallConsensus(filesAnalysis) {
  const approvals = filesAnalysis.filter(f => f.consensus.approved).length;
  const confidence = approvals / filesAnalysis.length;

  return {
    approved: confidence >= 0.70,  // Change threshold here
    confidence
  };
}
```

### Model Weights

```javascript
// Give different weights to models
const weightedConsensus = {
  claude: 0.5,    // 50% weight
  copilot: 0.3,   // 30% weight
  codex: 0.2      // 20% weight
};
```

---

## Monitoring & Analytics

### Track Model Performance

```bash
# Get statistics
npm run cli stats

# Output:
📊 Multi-Model AI Statistics

Models:
  Claude Requests: 150
  Copilot Requests: 148
  Codex Requests: 145

Consensus:
  Models Agreed: 120 (80%)
  Models Disagreed: 30 (20%)

Auto-Fix:
  Errors Fixed: 45
  Success Rate: 90%
```

### Dashboard

Access real-time dashboard:

```
http://localhost:3001/dashboard

Shows:
- Model usage distribution
- Consensus success rate
- Auto-fix accuracy
- Cost per PR
```

---

## Support

### Documentation
- 📖 [Main README](../README.md)
- 📖 [Deployment Guide](../../DEPLOYMENT.md)
- 📖 [API Reference](./API.md)

### Community
- 💬 [Discord](https://discord.gg/istani)
- 🐦 [Twitter](https://twitter.com/istani)
- 📧 [Email](mailto:support@istani.org)

### Issues
- 🐛 [Report Bug](https://github.com/sano1233/istani/issues/new?template=bug_report.md)
- ✨ [Request Feature](https://github.com/sano1233/istani/issues/new?template=feature_request.md)

---

<div align="center">

**Powered by Claude AI, GitHub Copilot & OpenAI Codex**

Made with ❤️ by the ISTANI Team

</div>
