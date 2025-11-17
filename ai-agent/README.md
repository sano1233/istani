# 🤖 ISTANI Autonomous AI Agent

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-blueviolet.svg)
![GitHub Copilot](https://img.shields.io/badge/GitHub-Copilot-green.svg)
![OpenAI Codex](https://img.shields.io/badge/OpenAI-Codex-orange.svg)

**Ultra-Secured Autonomous AI Agent with Multi-Model AI (Claude + Copilot + Codex) for Automated PR Handling, Code Review, Build, Test, Deploy, and Auto-Fix**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Configuration](#configuration) • [API](#api) • [Security](#security)

</div>

---

## 🌟 Features

### Core Capabilities

- **🤖 Multi-Model AI System** - Uses Claude AI, GitHub Copilot, and Codex working together
- **🔍 Intelligent Code Review** - Comprehensive analysis with consensus from multiple AI models
- **🔧 Automatic Error Resolution** - Detects and fixes errors automatically
- **🏗️ Automated Build & Test** - Automatically runs builds and tests on every PR
- **🔒 Security Scanning** - Detects secrets, vulnerabilities, and security issues
- **🚀 Automated Deployment** - Deploys to Vercel and Netlify automatically
- **🔀 Smart Auto-Merge** - Merges PRs when all checks pass
- **📊 Real-time Monitoring** - Dashboard for tracking agent performance
- **🎯 Context-Aware** - Understands your codebase and project requirements
- **⚡ Lightning Fast** - Processes PRs in seconds
- **🛡️ Ultra-Secure** - Webhook verification, secret scanning, and secure execution

### Advanced Features

- **🧠 Multi-Model Consensus** - Cross-validation between AI models for higher accuracy
- **🔧 Auto-Fix Errors** - Automatically fixes linting, type, and syntax errors
- **💡 Smart Code Suggestions** - Enhanced suggestions from Claude, Copilot, and Codex
- **📝 Comprehensive Reporting** - Detailed reports on every PR with multi-model insights
- **🔔 Smart Notifications** - Integrates with Slack, Discord, and email
- **🎮 Bot Commands** - Control the agent via PR comments (`/review`, `/deploy`, `/fix`, `/stats`)
- **📈 Analytics** - Track build success rates, deployment frequency, and more
- **🔄 Self-Healing** - Automatically retries failed operations
- **🐳 Docker Ready** - Full containerization support
- **☁️ Cloud Native** - Deploy to any cloud platform

### 🎯 Multi-Model AI Features

The agent leverages **three powerful AI models** working together:

| Model              | Purpose             | Strengths                                    |
| ------------------ | ------------------- | -------------------------------------------- |
| **Claude AI**      | Primary code review | Deep analysis, security, architecture review |
| **GitHub Copilot** | Code suggestions    | Contextual completions, best practices       |
| **OpenAI Codex**   | Error fixing        | Advanced debugging, auto-fix generation      |

**Benefits:**

- **Higher Accuracy** - Cross-validation catches more issues
- **Better Fixes** - Multiple AI models generate and rank solutions
- **Consensus Decisions** - 70% approval threshold for confidence
- **Auto-Fix Errors** - Automatically resolves detected issues

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- GitHub account with admin access to your repository
- **Anthropic API key** ([Get one here](https://console.anthropic.com/)) - Required
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys)) - Required for Codex/Copilot
- Vercel account ([Sign up](https://vercel.com/signup))
- Netlify account ([Sign up](https://app.netlify.com/signup))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/sano1233/istani.git
cd istani/ai-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. **Start the agent**

```bash
# Webhook server mode
npm start

# CLI mode
npm run cli process-all

# Development mode (with auto-reload)
npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f ai-agent

# Stop
docker-compose down
```

---

## 📖 Documentation

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required AI Models
ANTHROPIC_API_KEY=sk-ant-api03-xxx  # Claude AI
OPENAI_API_KEY=sk-xxx                # Codex/Copilot

# Required GitHub & Deployment
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo
VERCEL_TOKEN=xxx
NETLIFY_TOKEN=xxx

# Optional - Model Configuration
CLAUDE_ENABLED=true
COPILOT_ENABLED=true
CODEX_ENABLED=true
AUTO_FIX_ENABLED=true

# Optional - Agent Settings
GITHUB_WEBHOOK_SECRET=your-secret
AGENT_AUTO_MERGE=true
AGENT_AUTO_DEPLOY=true
CLAUDE_MODEL=claude-sonnet-4-5-20250929
OPENAI_MODEL=gpt-4-turbo-preview
```

See [Copilot & Codex Integration Guide](docs/COPILOT_CODEX_INTEGRATION.md) for detailed setup.

See [.env.example](ai-agent/.env.example) for all available options.

### GitHub Actions Workflow

The agent integrates seamlessly with GitHub Actions. Add this workflow to your repository:

```yaml
# .github/workflows/autonomous-ai-agent.yml
name: 🤖 Autonomous AI Agent

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  ai-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd ai-agent
          npm install
          npm run cli process ${{ github.event.pull_request.number }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### CLI Commands

```bash
# Process a specific PR
istani-agent process 123

# Process all open PRs
istani-agent process-all

# Perform code review only
istani-agent review 123

# Run security scan
istani-agent scan 123

# Deploy to production
istani-agent deploy

# Show statistics
istani-agent stats

# Check configuration
istani-agent config
```

### Webhook Setup

1. Go to your repository settings → Webhooks
2. Add webhook: `https://your-domain.com/webhook`
3. Content type: `application/json`
4. Secret: Your `GITHUB_WEBHOOK_SECRET`
5. Events: `Pull requests`, `Issue comments`, `Pushes`

### Bot Commands (in PR comments)

Users can control the agent by commenting on PRs:

- `/review` - Trigger manual code review
- `/deploy` - Deploy current PR
- `/merge` - Merge PR if all checks pass
- `/stats` - Show agent statistics

---

## 🔧 Configuration

### Agent Configuration

Edit `ai-agent/core/agent.mjs` to customize:

```javascript
const agent = new IstaniAIAgent({
  owner: 'your-username',
  repo: 'your-repo',
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 8000,
  securityEnabled: true,
  autoMerge: true,
  autoDeploy: true,
});
```

### Security Settings

The agent includes multiple security layers:

1. **Webhook Signature Verification** - Validates GitHub webhooks
2. **Secret Scanning** - Detects API keys, passwords, and tokens
3. **Dependency Scanning** - Checks for vulnerable dependencies
4. **Code Analysis** - Identifies security vulnerabilities
5. **Rate Limiting** - Prevents abuse

Configure security in `.env`:

```bash
AGENT_SECURITY_ENABLED=true
AGENT_MAX_PRS_PER_HOUR=50
AGENT_RATE_LIMIT_DELAY_MS=2000
```

---

## 📊 Monitoring Dashboard

Access the real-time monitoring dashboard:

```bash
# Start the webhook server
npm start

# Open browser to:
http://localhost:3001/dashboard

# Or serve the static dashboard
npx serve ai-agent/monitoring
```

The dashboard shows:

- PRs processed
- Build success rate
- Deployment statistics
- Security issues found
- Real-time activity log
- System health status

---

## 🔐 Security

### Best Practices

1. **Store secrets securely** - Use GitHub Secrets, never commit `.env`
2. **Enable webhook secrets** - Always set `GITHUB_WEBHOOK_SECRET`
3. **Use least privilege** - Grant minimum required permissions
4. **Regular updates** - Keep dependencies updated
5. **Monitor logs** - Review agent activity regularly
6. **Enable 2FA** - Protect all connected accounts

### Permissions Required

GitHub Token needs:

- `repo` - Repository access
- `workflow` - Workflow management
- `write:packages` - Package publishing
- `admin:repo_hook` - Webhook management

### Secret Scanning

The agent automatically scans for:

- API keys and tokens
- Private keys (SSH, SSL, etc.)
- Database credentials
- Cloud provider keys (AWS, GCP, Azure)
- Payment processor keys (Stripe, PayPal)

---

## 🎯 How It Works

### PR Processing Flow

```
1. PR Opened/Updated
   ↓
2. Security Scan (secret detection, vulnerability scanning)
   ↓
3. Fetch PR Details (files, diffs, metadata)
   ↓
4. AI Analysis with Claude (comprehensive code review)
   ↓
5. Post Review Comments (feedback and suggestions)
   ↓
6. Run Builds (npm run build)
   ↓
7. Run Tests (npm test)
   ↓
8. Deploy Preview (Vercel/Netlify)
   ↓
9. Auto-merge if approved (optional)
   ↓
10. Deploy to Production (if main branch)
```

### Architecture

```
┌─────────────────┐
│  GitHub Events  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│ Webhook Server  │◄────►│  Redis Cache │
└────────┬────────┘      └──────────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│   AI Agent      │◄────►│  Claude API  │
│   Core Logic    │      └──────────────┘
└────────┬────────┘
         │
         ├───────► Security Scanner
         ├───────► Build System
         ├───────► Test Runner
         ├───────► Deployment Manager
         └───────► Monitoring System
```

---

## 🧪 Testing

```bash
# Test webhook server
curl -X POST http://localhost:3001/health

# Test PR processing
npm run cli process 123

# Test security scan
npm run cli scan 123

# View stats
npm run cli stats
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

The AI agent will automatically review your PR!

---

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details

---

## 🆘 Support

- 📧 Email: support@istani.org
- 💬 Discord: [Join our community](https://discord.gg/istani)
- 🐛 Issues: [GitHub Issues](https://github.com/sano1233/istani/issues)
- 📖 Docs: [Full Documentation](https://docs.istani.org)

---

## 🙏 Acknowledgments

- Powered by [Claude AI](https://www.anthropic.com/claude) from Anthropic
- Built with [Octokit](https://github.com/octokit) for GitHub integration
- Deployed on [Vercel](https://vercel.com) and [Netlify](https://netlify.com)

---

<div align="center">

**Made with ❤️ by the ISTANI Team**

[Website](https://istaniorg.vercel.app) • [GitHub](https://github.com/sano1233/istani) • [Twitter](https://twitter.com/istani)

</div>
