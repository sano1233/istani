# 🤖 Automated GitHub Code Fixer/Resolver/Merger

**Complete System for Automated Code Quality, Conflict Resolution, and Intelligent Merging**

[![GitHub Actions](https://img.shields.io/badge/Automation-GitHub%20Actions-blue)](https://github.com/features/actions)
[![AI Powered](https://img.shields.io/badge/AI-Powered-green)](https://ai.google.dev/gemini-api)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Configuration](#configuration)
- [GitHub Actions Workflow](#github-actions-workflow)
- [AI Models](#ai-models)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

This comprehensive system automates the entire code review, fixing, conflict resolution, and merging process using advanced AI models. It ensures code quality, resolves merge conflicts intelligently, and merges PRs based on consensus from multiple AI reviewers.

### What It Does

1. **🔧 Automated Code Fixer**: Automatically fixes code quality issues
2. **🔀 Intelligent Conflict Resolver**: Resolves merge conflicts using AI consensus
3. **🤖 Automated Merger**: Reviews and merges PRs with multi-AI approval

### Why It's Powerful

- **Zero Manual Intervention**: Runs completely autonomously
- **Multi-AI Consensus**: Uses 3 AI models (Gemini, Claude, Qwen) for reliable decisions
- **Context-Aware**: Understands code semantics, not just syntax
- **Production-Ready**: Includes comprehensive error handling and fallbacks

---

## ✨ Features

### Automated Code Fixer

- ✅ **ESLint auto-fix** - Automatically fixes linting errors
- ✅ **Prettier formatting** - Ensures consistent code style
- ✅ **Security scanning** - Detects and fixes vulnerabilities
- ✅ **Dependency management** - Resolves package issues
- ✅ **Permission fixes** - Corrects file permissions
- ✅ **Syntax validation** - Checks for syntax errors
- ✅ **Conflict detection** - Identifies merge conflicts

### Intelligent Conflict Resolver

- 🔀 **Multi-AI resolution** - Consensus from multiple AI models
- 🔀 **Context-aware analysis** - Understands code intent
- 🔀 **Smart strategy selection** - Chooses best resolution method
- 🔀 **Lock file handling** - Regenerates lock files automatically
- 🔀 **Fallback mechanisms** - Multiple resolution strategies
- 🔀 **Validation** - Ensures resolved code is valid

### Automated Merger

- 🤖 **Comprehensive code review** - Detailed analysis from 3 AIs
- 🤖 **Consensus-based approval** - Requires 2/3 AI approval
- 🤖 **Security checks** - Validates for vulnerabilities
- 🤖 **Quality assessment** - Evaluates code quality
- 🤖 **Automatic merging** - Smart merge strategy selection
- 🤖 **Rollback capability** - Can revert if needed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Pull Request                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow Trigger                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Code Fixer  │ │   Conflict   │ │  AI Review   │
│              │ │   Resolver   │ │  & Merger    │
│ • ESLint     │ │ • Multi-AI   │ │ • Gemini     │
│ • Prettier   │ │ • Context    │ │ • Claude     │
│ • Security   │ │ • Strategies │ │ • Qwen       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Consensus Check │
              │   (2/3 approval) │
              └────────┬─────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
         ┌──────────┐  ┌──────────┐
         │  Approve │  │  Reject  │
         │  & Merge │  │  PR      │
         └──────────┘  └──────────┘
```

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- Git 2.30+
- GitHub CLI (`gh`) installed and authenticated
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd ai-brain && npm install
   ```

3. **Configure API keys**
   
   Create environment variables or GitHub Secrets:
   
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   export ANTHROPIC_API_KEY="your-claude-api-key"  # or CLAUDE
   export QWEN_API_KEY="your-qwen-api-key"
   ```

4. **Validate installation**
   ```bash
   node ai-brain/system-validator.js --full
   ```

### GitHub Secrets Configuration

For GitHub Actions, add these secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `GEMINI_API_KEY`
   - `CLAUDE` (or `ANTHROPIC_API_KEY`)
   - `QWEN_API_KEY`

---

## 🚀 Usage

### Command Line Interface

#### 1. Automated Code Fixer

```bash
# Fix all files in repository
node ai-brain/automated-code-fixer.js

# Fix specific file
node ai-brain/automated-code-fixer.js --file src/app.js

# Check only (no fixes applied)
node ai-brain/automated-code-fixer.js --check-only

# Fix and commit
node ai-brain/automated-code-fixer.js --commit
```

#### 2. Intelligent Conflict Resolver

```bash
# Resolve conflicts in PR
node ai-brain/intelligent-conflict-resolver.js --pr 123

# Resolve conflicts in branch
node ai-brain/intelligent-conflict-resolver.js --branch feature/my-feature

# Resolve specific file
node ai-brain/intelligent-conflict-resolver.js --file src/app.js

# Use specific strategy
node ai-brain/intelligent-conflict-resolver.js --pr 123 --strategy ai

# Auto-commit resolved conflicts
node ai-brain/intelligent-conflict-resolver.js --pr 123 --commit
```

**Available Strategies:**
- `auto` - Automatically select best strategy (default)
- `ai` - Use AI-powered resolution
- `theirs` - Accept incoming changes
- `ours` - Keep current changes

#### 3. Automated Merger

```bash
# Process specific PR
node ai-brain/automated-merger.js --pr 123

# Process all open PRs
node ai-brain/automated-merger.js --all

# Require all 3 AI approvals
node ai-brain/automated-merger.js --pr 123 --require 3

# Auto-fix issues before merging
node ai-brain/automated-merger.js --pr 123 --auto-fix

# Process all with auto-fix
node ai-brain/automated-merger.js --all --auto-fix --require 2
```

#### 4. System Validator

```bash
# Quick validation
node ai-brain/system-validator.js --quick

# Full validation
node ai-brain/system-validator.js --full
```

### GitHub Actions (Automatic)

The system runs automatically on:

- **Pull Request Events**: opened, synchronize, reopened
- **Schedule**: Every 6 hours
- **Manual Trigger**: Via workflow_dispatch

#### Manual Workflow Trigger

1. Go to **Actions** → **Automated Code Fixer/Resolver/Merger**
2. Click **Run workflow**
3. Configure options:
   - PR number (optional)
   - Auto-fix enabled (true/false)
   - Required approvals (1-3)

---

## 🔧 Components

### 1. Automated Code Fixer (`automated-code-fixer.js`)

**Purpose**: Automatically detect and fix code quality issues

**Features**:
- ESLint auto-fix for JavaScript/TypeScript
- Prettier formatting
- Security vulnerability scanning (npm audit)
- Dependency issue resolution
- File permission corrections
- Syntax error detection
- Merge conflict detection

**Usage**:
```javascript
const fixer = require('./ai-brain/automated-code-fixer');

// Run specific fixes
await fixer.runESLintFix();
await fixer.runPrettierFix();
await fixer.runSecurityScan();
await fixer.fixDependencyIssues();
```

### 2. Intelligent Conflict Resolver (`intelligent-conflict-resolver.js`)

**Purpose**: Resolve merge conflicts using AI consensus

**Features**:
- Multi-AI consensus resolution (Gemini, Claude, Qwen)
- Context-aware conflict analysis
- Smart strategy selection based on file type
- Lock file regeneration
- Validation of resolved code

**Usage**:
```javascript
const resolver = require('./ai-brain/intelligent-conflict-resolver');

// Resolve all conflicts in PR
await resolver.resolveAllConflicts({ prNumber: 123 });

// Resolve specific file
await resolver.resolveFileConflict('src/app.js', 'ai');

// Analyze conflict
const analysis = resolver.analyzeConflict(content, 'src/app.js');
```

**Resolution Strategies**:
1. **AI**: Multi-AI consensus resolution
2. **Theirs**: Accept incoming changes
3. **Ours**: Keep current changes
4. **Regenerate**: Regenerate lock files
5. **Auto**: Automatically select best strategy

### 3. Automated Merger (`automated-merger.js`)

**Purpose**: Review and merge PRs based on AI consensus

**Features**:
- Comprehensive code review from 3 AI models
- Consensus-based approval (configurable threshold)
- Security and quality checks
- Automatic merge with smart strategy selection
- Detailed review comments

**Usage**:
```javascript
const merger = require('./ai-brain/automated-merger');

// Process single PR
await merger.processPR(123, { requiredApprovals: 2, autoFix: true });

// Process all open PRs
await merger.processAllPRs({ requiredApprovals: 2 });

// Get PR details
const pr = await merger.getPRDetails(123);

// Perform AI review
const { reviews, approvals } = await merger.performAICodeReview(pr);
```

### 4. System Validator (`system-validator.js`)

**Purpose**: Validate system health and configuration

**Features**:
- Node.js version check
- Git installation and configuration
- GitHub CLI validation
- Dependency validation
- AI service connectivity tests
- Component functionality tests

**Usage**:
```bash
# Quick check
node ai-brain/system-validator.js --quick

# Full validation
node ai-brain/system-validator.js --full
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# AI Service API Keys
GEMINI_API_KEY=your-gemini-api-key
ANTHROPIC_API_KEY=your-claude-api-key  # or CLAUDE
QWEN_API_KEY=your-qwen-api-key

# GitHub Token (usually set by GitHub Actions)
GH_TOKEN=your-github-token

# Optional Configuration
NODE_ENV=production
```

### GitHub Actions Configuration

Edit `.github/workflows/automated-code-resolver-merger.yml`:

```yaml
env:
  NODE_VERSION: '20'  # Node.js version

jobs:
  ai-review-and-merge:
    environment: unified-software-automated-developer-and-deployer
    # Your environment with AI API keys configured
```

### Consensus Requirements

Adjust required approvals in workflow:

```yaml
inputs:
  required_approvals:
    default: '2'  # Require 2 out of 3 AI approvals
```

---

## 🔄 GitHub Actions Workflow

### Workflow Structure

The workflow consists of 5 main jobs:

#### 1. **Auto-Fix Code** (`auto-fix-code`)
- Runs on: PR events, workflow_dispatch
- Actions:
  - Checkout code
  - Install dependencies
  - Run automated code fixer
  - Commit and push fixes

#### 2. **Resolve Conflicts** (`resolve-conflicts`)
- Runs after: auto-fix-code
- Actions:
  - Check for merge conflicts
  - Resolve conflicts using AI
  - Commit resolutions

#### 3. **AI Review & Merge** (`ai-review-and-merge`)
- Runs after: auto-fix-code, resolve-conflicts
- Actions:
  - Perform multi-AI code review
  - Check consensus
  - Approve and merge if consensus reached

#### 4. **Health Check** (`health-check`)
- Runs after: all previous jobs
- Actions:
  - Run tests
  - Run build
  - Check system health
  - Generate workflow summary

#### 5. **Notify Results** (`notify-results`)
- Runs after: all jobs
- Actions:
  - Post status comment on PR
  - Summarize results

### Workflow Triggers

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, master]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger
```

---

## 🤖 AI Models

The system uses three AI models for consensus-based decision making:

### 1. **Google Gemini Pro**
- **Strengths**: Fast response, broad knowledge
- **Use Cases**: Code analysis, quick reviews
- **API**: Google AI Studio
- **Configuration**: `GEMINI_API_KEY`

### 2. **Anthropic Claude 3.5 Sonnet**
- **Strengths**: Deep code understanding, reasoning
- **Use Cases**: Complex code review, architecture analysis
- **API**: Anthropic API
- **Configuration**: `ANTHROPIC_API_KEY` or `CLAUDE`

### 3. **Alibaba Qwen Max**
- **Strengths**: Alternative perspective, diverse knowledge
- **Use Cases**: Validation, additional insights
- **API**: Dashscope API
- **Configuration**: `QWEN_API_KEY`

### Consensus Mechanism

- **Default**: 2 out of 3 approvals required
- **Configurable**: Can require 1, 2, or 3 approvals
- **Decision Format**:
  ```
  DECISION: [APPROVE/REQUEST_CHANGES/COMMENT]
  CONFIDENCE: [HIGH/MEDIUM/LOW]
  ```

---

## 📝 Examples

### Example 1: Auto-Fix and Merge PR

```bash
# Process PR #123 with auto-fix enabled
node ai-brain/automated-merger.js --pr 123 --auto-fix --require 2
```

**What happens**:
1. ✅ Fetches PR details
2. 🔧 Runs code quality fixes
3. 🔀 Resolves any conflicts
4. 🤖 Gets reviews from 3 AIs
5. ✅ Merges if 2+ AIs approve

### Example 2: Batch Process All PRs

```bash
# Process all open PRs with auto-fix
node ai-brain/automated-merger.js --all --auto-fix --require 2
```

### Example 3: Resolve Conflicts in Specific File

```bash
# Resolve conflicts using AI
node ai-brain/intelligent-conflict-resolver.js --file src/app.js --strategy ai
```

### Example 4: CI/CD Integration

```yaml
# .github/workflows/custom-ci.yml
jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Auto-fix code quality
        run: node ai-brain/automated-code-fixer.js --commit
      
      - name: Validate fixes
        run: node ai-brain/system-validator.js --quick
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "API key not configured"

**Problem**: AI service returns error about missing API key

**Solution**:
```bash
# Set environment variables
export GEMINI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
export QWEN_API_KEY="your-key-here"

# Or add to GitHub Secrets
# Settings → Secrets → Actions → New repository secret
```

#### 2. "GitHub CLI not authenticated"

**Problem**: `gh` commands fail with authentication error

**Solution**:
```bash
# Authenticate GitHub CLI
gh auth login

# Verify authentication
gh auth status
```

#### 3. "Merge conflicts could not be resolved"

**Problem**: AI fails to resolve conflicts

**Solution**:
```bash
# Try different strategy
node ai-brain/intelligent-conflict-resolver.js --pr 123 --strategy theirs

# Or manually resolve
git checkout <branch>
# resolve conflicts manually
git commit
```

#### 4. "No consensus reached"

**Problem**: Less than 2/3 AIs approved

**Solution**:
- Review AI feedback in PR comments
- Address concerns raised by AIs
- Push fixes and re-run
- Or lower consensus threshold: `--require 1`

#### 5. "System validation failed"

**Problem**: System validator reports failures

**Solution**:
```bash
# Run full validation to see details
node ai-brain/system-validator.js --full

# Install missing dependencies
npm install
cd ai-brain && npm install

# Verify Git and GitHub CLI
git --version
gh --version
```

### Debug Mode

Enable verbose logging:

```bash
# Add debug flag (if implemented)
NODE_ENV=development node ai-brain/automated-merger.js --pr 123
```

### Getting Help

1. Check system validator: `node ai-brain/system-validator.js --full`
2. Review GitHub Actions logs
3. Check AI service status
4. Review error messages in PR comments

---

## 📊 Performance & Limits

### Processing Times

- **Code Fixer**: ~30-60 seconds per PR
- **Conflict Resolver**: ~15-45 seconds per file
- **AI Review**: ~30-90 seconds per PR
- **Total**: ~1-3 minutes per PR

### Rate Limits

- **GitHub API**: 5000 requests/hour (authenticated)
- **AI Services**: Varies by provider
  - Gemini: 60 requests/minute
  - Claude: 50 requests/minute
  - Qwen: 100 requests/minute

### Best Practices

- Process PRs in batches of 10-20
- Use scheduled workflows for bulk processing
- Monitor API usage
- Implement retry logic for rate limiting

---

## 🔐 Security Considerations

### API Key Management

✅ **DO**:
- Store API keys in GitHub Secrets
- Use environment-specific keys
- Rotate keys regularly
- Limit key permissions

❌ **DON'T**:
- Commit API keys to repository
- Share keys in logs or comments
- Use production keys in development

### Code Review

The system performs security checks for:
- Exposed credentials
- Known vulnerabilities (npm audit)
- Suspicious code patterns
- Dependency security

### Access Control

- Use GitHub environments for protection
- Require approval for production merges
- Implement branch protection rules
- Review AI decisions regularly

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Development Setup

```bash
# Fork and clone
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo

# Install dependencies
npm install
cd ai-brain && npm install

# Validate setup
node ai-brain/system-validator.js --full

# Create feature branch
git checkout -b feature/my-feature
```

### Testing

```bash
# Run validation
node ai-brain/system-validator.js --full

# Test components
node ai-brain/automated-code-fixer.js --check-only
node ai-brain/system-validator.js
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR
5. AI review will run automatically
6. Address feedback
7. Merge when approved

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Google Gemini** - AI-powered code analysis
- **Anthropic Claude** - Advanced reasoning
- **Alibaba Qwen** - Alternative insights
- **GitHub Actions** - Automation platform
- **GitHub CLI** - Command-line integration

---

## 📞 Support

- **Documentation**: This file
- **Issues**: [GitHub Issues](https://github.com/yourusername/yourrepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/yourrepo/discussions)

---

## 🗺️ Roadmap

### Coming Soon

- [ ] OpenAI GPT-4 integration
- [ ] Custom rule configuration
- [ ] Web dashboard for monitoring
- [ ] Slack/Discord notifications
- [ ] Performance analytics
- [ ] Advanced conflict resolution strategies
- [ ] Multi-repository support
- [ ] Custom AI model training

---

**Built with ❤️ by the AI Brain team**

*Last updated: 2025-11-17*
