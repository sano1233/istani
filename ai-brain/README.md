# AI Brain - Enterprise Grade Automated PR System

Multi-AI analysis with auto-resolution and auto-merge.

## Setup
All secrets are managed through the unified GitHub environment: `unified-software-automated-developer-and-deployer`

See [Environment Setup Guide](../.github/ENVIRONMENT-SETUP.md) for configuration details.

## Features
- Auto PR analysis (Gemini, Claude, Qwen)
- Auto conflict resolution
- Auto merge on approval
- **Auto-fix and merge failed PRs** - Automatically resolves conflicts and fixes CI failures

## Usage

### Fix All Failed PRs
```bash
cd ai-brain
npm install
node fix-failed-prs.js
```

Or from workspace root:
```bash
node fix-failed-prs.js
```

This script will:
1. Find all open PRs with conflicts or CI failures
2. Resolve merge conflicts using AI
3. Analyze CI failures and post suggestions
4. Automatically merge PRs once conflicts are resolved and checks pass
