# AI Brain - Enterprise Grade Automated PR System

Multi-AI analysis with auto-resolution and auto-merge.

## Setup
All secrets are managed through the unified GitHub environment: `unified-software-automated-developer-and-deployer`

See [Environment Setup Guide](../.github/ENVIRONMENT-SETUP.md) for configuration details.

## Features
- 🤖 Multi-AI PR analysis (Gemini, Claude, Qwen)
- 🔍 Automated code error detection
  - JavaScript syntax validation
  - HTML structure validation
  - CSS syntax validation
- 🔧 AI-powered error auto-fixing
- ⚔️ Auto conflict resolution
- ✅ Auto approval & merge (requires 2/3 AI consensus)
- 📊 Comprehensive PR analysis reports

## How It Works

1. **Conflict Resolution**: Automatically resolves merge conflicts using AI
2. **Error Detection**: Scans JavaScript, HTML, and CSS for syntax errors
3. **Auto-Fix**: Uses AI models to fix detected errors and commits changes
4. **AI Review**: Three AI models review the PR independently
5. **Auto-Merge**: Merges PR if 2+ AI models approve and all fixes succeeded
