# Quick Start Guide - Multi-Agent Code Review

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Key
Visit https://console.anthropic.com/ and get your Anthropic API key

### 2. Add to GitHub Secrets
1. Go to https://github.com/sano1233/istani/settings/secrets/actions
2. Click "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: Paste your API key
5. Click "Add secret"

### 3. Upload Files to Repository

You need to add these files to the `istani` repository:

#### Workflow File
- Upload `enhanced-multi-agent-review.yml` to `.github/workflows/` in your repo

#### Agent Files (all go in `agents/` directory)
- `security-agent.js`
- `code-quality-agent.js`
- `test-agent.js`
- `performance-agent.js`
- `documentation-agent.js`
- `architecture-agent.js`
- `orchestrator.js`
- `auto-fix-agent.js`
- `merge-decision-agent.js`
- `command-handler.js`
- `package.json`

### 4. Test It

Create a test PR and watch the magic happen! The system will automatically:
1. Run all 6 specialized agents
2. Analyze your code comprehensively
3. Post a detailed review comment
4. Apply auto-fixes for common issues
5. Decide if the PR can be auto-merged

## 🎮 Using the System

### Automatic Mode
The review runs automatically on every PR. No action needed!

### Manual Commands
Comment on any PR with:

```
/agent review       # Run full multi-agent review
/agent security     # Security check only
/agent quality      # Code quality only
/agent fix          # Apply auto-fixes
/agent merge        # Check merge eligibility
/agent help         # Show all commands
```

## 📊 What You Get

Each PR receives a comprehensive review covering:

- 🔒 **Security**: Vulnerabilities, secrets, injection risks
- ✨ **Code Quality**: Maintainability, best practices, patterns
- 🧪 **Testing**: Coverage gaps, test suggestions
- ⚡ **Performance**: Bottlenecks, optimization opportunities
- 📚 **Documentation**: Missing docs, unclear code
- 🏗️ **Architecture**: Design decisions, scalability

## 💡 Pro Tips

1. **Start Small**: Create a small test PR first
2. **Review Output**: Check the review comments to understand the format
3. **Adjust Settings**: Customize agent prompts in the agent files
4. **Use Commands**: Use `/agent help` to see all available commands
5. **Monitor Costs**: Each PR costs ~$0.40-$1.20 in API calls

## 🐛 Common Issues

**"API key not found"** → Check that you added `ANTHROPIC_API_KEY` to GitHub Secrets

**"gh command not found"** → The workflow installs it automatically, wait for setup

**Agents not running** → Check the Actions tab for error logs

## 📖 Full Documentation

See `SETUP-MULTI-AGENT-REVIEW.md` for:
- Detailed installation steps
- Configuration options
- Troubleshooting guide
- Cost estimates
- Advanced customization

## 🎯 Your Next Steps

1. ✅ Add `ANTHROPIC_API_KEY` to GitHub Secrets
2. ✅ Upload all files to the repository
3. ✅ Create a test PR
4. ✅ Review the automated feedback
5. ✅ Customize agent prompts (optional)
6. ✅ Enable auto-merge (optional)

---

**Ready to start?** Upload the files and create a PR! 🚀
