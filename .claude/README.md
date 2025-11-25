# Claude Code Configuration

This directory contains Claude Code configuration and skills for enhanced AI-powered development.

## 📁 Structure

- `skills/` - Custom Claude Code skills
  - `gemini-analyzer.md` - Gemini CLI wrapper for large codebase analysis
  - `qwen-analyzer.md` - Qwen 3 Coder wrapper for advanced code generation
- `AI_SETUP.md` - Complete setup guide for all AI tools
- `env.example` - Example environment variables

## 🚀 Quick Start

1. **Set up API keys** (see `env.example`):
   ```bash
   export QWEN_API_KEY="your_key"
   export GEMINI_API_KEY="your_key"
   ```

2. **Start the router**:
   ```bash
   ccr start
   claude-code
   ```

3. **Use the skills**:
   - `@qwen-analyzer` - For code generation and refactoring
   - `@gemini-analyzer` - For codebase analysis

## 📖 Documentation

See [AI_SETUP.md](./AI_SETUP.md) for comprehensive setup instructions and usage examples.

## 🔧 Tools Installed

- ✅ Qwen CLI (v0.2.3)
- ✅ Gemini CLI (v0.17.1)
- ✅ Claude Code Router
- ✅ Router Configuration (~/.claude-code-router/config.json)

## 🎯 Features

- **Intelligent Routing**: Automatically routes tasks to the best AI model
- **Maximum Tokens**: Configured for comprehensive responses
- **Long Context**: Gemini handles 1M+ token context windows
- **Advanced Reasoning**: Qwen provides deep code understanding
- **Comprehensive Analysis**: Both models work together for optimal results
