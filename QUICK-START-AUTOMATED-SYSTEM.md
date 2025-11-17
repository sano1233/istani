# 🚀 Quick Start: Automated Code Fixer/Resolver/Merger

Get up and running in 5 minutes!

## ⚡ Quick Installation

```bash
# 1. Install dependencies
npm install
cd ai-brain && npm install && cd ..

# 2. Set API keys (required for AI features)
export GEMINI_API_KEY="your-gemini-key"
export ANTHROPIC_API_KEY="your-claude-key"
export QWEN_API_KEY="your-qwen-key"

# 3. Validate installation
node ai-brain/system-validator.js --quick
```

## 🎯 Quick Usage

### Interactive Launcher (Easiest)

```bash
# Launch interactive menu
./ai-brain/launcher.sh
```

### Common Commands

```bash
# Fix code quality in current PR
node ai-brain/automated-code-fixer.js --commit

# Resolve merge conflicts in PR #123
node ai-brain/intelligent-conflict-resolver.js --pr 123 --commit

# Review and merge PR #123
node ai-brain/automated-merger.js --pr 123 --auto-fix

# Process all open PRs
node ai-brain/automated-merger.js --all --auto-fix
```

## 📋 GitHub Actions Setup

### 1. Add Secrets

Go to **Settings → Secrets → Actions** and add:

- `GEMINI_API_KEY`
- `CLAUDE` (or `ANTHROPIC_API_KEY`)
- `QWEN_API_KEY`

### 2. Enable Workflow

The workflow is already configured at:
`.github/workflows/automated-code-resolver-merger.yml`

It runs automatically on:

- Pull requests
- Every 6 hours (scheduled)
- Manual trigger

### 3. Manual Trigger

1. Go to **Actions** tab
2. Select "Automated Code Fixer/Resolver/Merger"
3. Click "Run workflow"
4. Enter options (PR number, auto-fix, etc.)

## 🔥 Quick Examples

### Example 1: Fix My PR

```bash
# Your PR has issues? Fix them automatically:
node ai-brain/automated-code-fixer.js --commit
node ai-brain/automated-merger.js --pr YOUR_PR_NUMBER --auto-fix
```

### Example 2: Resolve Conflicts

```bash
# PR has merge conflicts? Resolve with AI:
node ai-brain/intelligent-conflict-resolver.js --pr YOUR_PR_NUMBER --commit
```

### Example 3: Clean Up Repository

```bash
# Process all pending PRs:
node ai-brain/automated-merger.js --all --auto-fix --require 2
```

## ✅ Verify Everything Works

```bash
# Run full system validation
node ai-brain/system-validator.js --full
```

You should see all green checkmarks ✅

## 📖 Full Documentation

For complete details, see: [AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md](./AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md)

## 🆘 Troubleshooting

### "API key not configured"

```bash
export GEMINI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
export QWEN_API_KEY="your-key"
```

### "gh command not found"

```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: See https://cli.github.com/
gh auth login
```

### "Module not found"

```bash
npm install
cd ai-brain && npm install
```

## 🎉 That's It!

You're ready to automate your GitHub workflow!

**Next Steps:**

1. Try the interactive launcher: `./ai-brain/launcher.sh`
2. Process a test PR
3. Check GitHub Actions logs
4. Read the full guide for advanced features

---

**Need Help?** Check the [full documentation](./AUTOMATED-CODE-RESOLVER-MERGER-GUIDE.md)
