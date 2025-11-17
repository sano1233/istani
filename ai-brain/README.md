# AI Brain - Unified Full Stack System

Enterprise automated AI with VS Code, Cursor, Gemini, Claude, Codex, Qwen.

## Setup

All secrets are managed through the unified GitHub environment: `unified-software-automated-developer-and-deployer`

See [Environment Setup Guide](../.github/ENVIRONMENT-SETUP.md) for configuration details.

## Usage

**Unified query (all AIs):**

```bash
unified.bat "your prompt"
```

**Individual AIs:**

```bash
gemini.bat "prompt"
claude.bat "prompt"
codex.bat "prompt"
qwen.bat "prompt"
```

## Environment Variables

For local development, you can use these environment variables (though GitHub environment is preferred):

```
GEMINI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
QWEN_API_KEY=your_key
```

## Features

- Auto PR review & merge
- VS Code integration
- Cursor AI support
- Multi-AI consensus
- Auto conflict resolution
