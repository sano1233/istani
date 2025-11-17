# 🤖 AI Brain - Automated Code Fixer/Resolver/Merger

**Complete Automated GitHub Code Management System**

## 🎯 Overview

This system provides comprehensive automation for GitHub pull request management:

- **🔧 Automated Code Fixer**: Fixes linting, formatting, security, and dependency issues
- **🔀 Intelligent Conflict Resolver**: AI-powered merge conflict resolution
- **🤖 Automated Merger**: Multi-AI consensus-based PR review and merging

## 📦 Components

```
ai-brain/
├── automated-code-fixer.js          # Code quality fixer
├── intelligent-conflict-resolver.js # Conflict resolution
├── automated-merger.js              # PR review & merge
├── system-validator.js              # Health checks
├── pr-analyzer.js                   # Branch analysis
├── pr-handler.js                    # Individual PR processing
├── fix-failed-prs.js                # Batch PR fixing
├── auto-fix-system.js               # Issue scanning
├── launcher.sh                      # Interactive menu
├── *-helper.js                      # AI service helpers
└── README-AUTOMATED-SYSTEM.md       # This file
```

## 🚀 Quick Start

### Interactive Mode
```bash
./ai-brain/launcher.sh
```

### Command Line

```bash
# Fix code quality
node ai-brain/automated-code-fixer.js

# Resolve conflicts in PR
node ai-brain/intelligent-conflict-resolver.js --pr 123

# Review and merge PR
node ai-brain/automated-merger.js --pr 123 --auto-fix

# Validate system
node ai-brain/system-validator.js --full
```

## 📖 Documentation

- **Full Guide**: [../AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md](../AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md)
- **Quick Start**: [../QUICK-START-AUTOMATED-SYSTEM.md](../QUICK-START-AUTOMATED-SYSTEM.md)
- **PR Automation**: [../docs/PR-AUTOMATION.md](../docs/PR-AUTOMATION.md)

## ⚙️ Configuration

### Environment Variables

```bash
# AI Service API Keys (required)
export GEMINI_API_KEY="your-gemini-api-key"
export ANTHROPIC_API_KEY="your-claude-api-key"
export QWEN_API_KEY="your-qwen-api-key"

# GitHub Token (usually automatic in CI)
export GH_TOKEN="your-github-token"
```

### GitHub Actions

The system runs automatically via GitHub Actions:
- **Workflow**: `.github/workflows/automated-code-resolver-merger.yml`
- **Triggers**: PR events, schedule, manual
- **Environment**: `unified-software-automated-developer-and-deployer`

## 🎨 Features

### Automated Code Fixer

- ✅ ESLint auto-fix
- ✅ Prettier formatting
- ✅ Security scanning (npm audit)
- ✅ Dependency resolution
- ✅ Permission fixes
- ✅ Syntax validation
- ✅ Conflict detection

### Intelligent Conflict Resolver

- 🔀 Multi-AI consensus resolution
- 🔀 Context-aware analysis
- 🔀 Smart strategy selection
- 🔀 Lock file regeneration
- 🔀 Validation checks
- 🔀 Fallback mechanisms

### Automated Merger

- 🤖 3 AI models (Gemini, Claude, Qwen)
- 🤖 Consensus-based approval (2/3 required)
- 🤖 Comprehensive code review
- 🤖 Security checks
- 🤖 Smart merge strategy
- 🤖 Auto-fix integration

## 📊 System Validation

Check system health:

```bash
# Quick check
node ai-brain/system-validator.js --quick

# Full validation
node ai-brain/system-validator.js --full
```

Validates:
- Node.js version
- Git configuration
- GitHub CLI
- Dependencies
- AI services
- Component functionality

## 🔄 Workflow Integration

### For Pull Requests

The system automatically:
1. Fixes code quality issues
2. Resolves merge conflicts
3. Performs AI review
4. Merges if consensus reached

### Manual Processing

```bash
# Process specific PR
node ai-brain/automated-merger.js --pr 123 --auto-fix

# Process all open PRs
node ai-brain/automated-merger.js --all --auto-fix
```

## 🎯 Use Cases

### Daily Development

```bash
# Before committing
node ai-brain/automated-code-fixer.js --commit
```

### PR Management

```bash
# Review and merge PR
node ai-brain/automated-merger.js --pr <number> --auto-fix
```

### Conflict Resolution

```bash
# Resolve conflicts
node ai-brain/intelligent-conflict-resolver.js --pr <number> --commit
```

### Batch Processing

```bash
# Clean up all pending PRs
node ai-brain/automated-merger.js --all --require 2
```

## 🔧 Advanced Usage

### Custom Consensus Threshold

```bash
# Require all 3 AIs to approve
node ai-brain/automated-merger.js --pr 123 --require 3

# Accept with 1 approval
node ai-brain/automated-merger.js --pr 123 --require 1
```

### Specific Conflict Strategy

```bash
# Use AI resolution
node ai-brain/intelligent-conflict-resolver.js --pr 123 --strategy ai

# Accept incoming changes
node ai-brain/intelligent-conflict-resolver.js --pr 123 --strategy theirs

# Keep current changes
node ai-brain/intelligent-conflict-resolver.js --pr 123 --strategy ours
```

### Check Only Mode

```bash
# Check without applying fixes
node ai-brain/automated-code-fixer.js --check-only
```

## 🐛 Troubleshooting

### Common Issues

1. **API Keys Not Set**
   ```bash
   export GEMINI_API_KEY="your-key"
   export ANTHROPIC_API_KEY="your-key"
   export QWEN_API_KEY="your-key"
   ```

2. **GitHub CLI Not Authenticated**
   ```bash
   gh auth login
   gh auth status
   ```

3. **Dependencies Missing**
   ```bash
   npm install
   cd ai-brain && npm install
   ```

4. **Git Not Configured**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"
   ```

### Validation

Run system validator to diagnose issues:

```bash
node ai-brain/system-validator.js --full
```

## 📈 Performance

- **Code Fixer**: ~30-60s per PR
- **Conflict Resolver**: ~15-45s per file
- **AI Review**: ~30-90s per PR
- **Total Processing**: ~1-3 minutes per PR

## 🔐 Security

- API keys stored in GitHub Secrets
- No credentials in code
- Automatic security scanning
- Validated before merging

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test with system validator
4. Submit PR
5. Automated review will run

## 📄 License

MIT License - See [LICENSE](../LICENSE)

## 🆘 Support

- **Documentation**: Full guide in repository root
- **Issues**: GitHub Issues
- **Validation**: `node ai-brain/system-validator.js --full`

## 🎉 Quick Commands Cheatsheet

```bash
# Interactive launcher
./ai-brain/launcher.sh

# Fix code
node ai-brain/automated-code-fixer.js --commit

# Resolve conflicts
node ai-brain/intelligent-conflict-resolver.js --pr <number> --commit

# Review and merge
node ai-brain/automated-merger.js --pr <number> --auto-fix

# Process all PRs
node ai-brain/automated-merger.js --all --auto-fix

# Validate system
node ai-brain/system-validator.js --full

# Analyze branches
node ai-brain/pr-analyzer.js --analyze
```

---

**Built with ❤️ using AI Brain technology**

*Powered by: Google Gemini, Anthropic Claude, and Alibaba Qwen*
