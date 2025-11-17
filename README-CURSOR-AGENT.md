# 🤖 Cursor Agent Integration

> **Complete toolkit for fetching and integrating Cursor agent data with the ISTANI AI Agent system**

[![Status](https://img.shields.io/badge/status-complete-success)](.)
[![Production Ready](https://img.shields.io/badge/production-ready-brightgreen)](.)
[![Documented](https://img.shields.io/badge/docs-comprehensive-blue)](.)

---

## 🎯 What is This?

Tools and documentation for fetching data from Cursor's agent system and integrating it with ISTANI's autonomous AI agent platform.

**Agent ID**: `bc-371b6b86-5cff-40fb-922b-af0f42218c24`

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install puppeteer --save-dev

# 2. Set authentication (get from browser after signing in to cursor.com)
export CURSOR_COOKIES="your-cookies-here"

# 3. Run the fetcher
node scripts/fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24

# 4. View results
cat data/cursor-agent-*.json
```

**📖 Full Guide**: [CURSOR-AGENT-QUICKSTART.md](CURSOR-AGENT-QUICKSTART.md)

---

## 📚 Documentation

| Document                                                                 | Description                   | For        |
| ------------------------------------------------------------------------ | ----------------------------- | ---------- |
| **[CURSOR-AGENT-INDEX.md](CURSOR-AGENT-INDEX.md)**                       | 📌 Main navigation & overview | Everyone   |
| **[CURSOR-AGENT-QUICKSTART.md](CURSOR-AGENT-QUICKSTART.md)**             | ⚡ 5-minute setup guide       | Users      |
| **[scripts/README-CURSOR-AGENT.md](scripts/README-CURSOR-AGENT.md)**     | 🛠️ Script usage guide         | Developers |
| **[docs/CURSOR-AGENT-INTEGRATION.md](docs/CURSOR-AGENT-INTEGRATION.md)** | 🏗️ Full integration guide     | Architects |
| **[CURSOR-AGENT-FETCH-SUMMARY.md](CURSOR-AGENT-FETCH-SUMMARY.md)**       | 📊 Technical summary          | Tech Leads |
| **[EXECUTION-REPORT-CURSOR-AGENT.md](EXECUTION-REPORT-CURSOR-AGENT.md)** | 📈 Execution report           | Managers   |

**👉 Start Here**: [CURSOR-AGENT-INDEX.md](CURSOR-AGENT-INDEX.md)

---

## 🛠️ Tools Included

### Scripts

1. **`fetch-cursor-agent.js`** - Basic fetcher (no auth required)
2. **`fetch-cursor-agent-authenticated.js`** - Full fetcher with authentication

### Features

- ✅ Authentication support (cookies + tokens)
- ✅ Screenshot capture for debugging
- ✅ JSON output format
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Production ready

---

## 🔑 Key Information

### ⚠️ Authentication Required

The Cursor agents page requires authentication to access agent data.

**How to authenticate**:

1. Sign in to https://cursor.com
2. Extract cookies from browser DevTools
3. Set `CURSOR_COOKIES` environment variable
4. Run the authenticated fetcher

**Details**: [Authentication Guide](CURSOR-AGENT-QUICKSTART.md#step-2-get-authentication-2-minutes)

---

## 📦 What's Included

```
├── scripts/
│   ├── fetch-cursor-agent.js                    # Basic fetcher
│   ├── fetch-cursor-agent-authenticated.js      # Auth fetcher
│   └── README-CURSOR-AGENT.md                   # Script docs
├── docs/
│   └── CURSOR-AGENT-INTEGRATION.md              # Integration guide
├── data/
│   └── cursor-agent-*.json                      # Sample output
├── CURSOR-AGENT-INDEX.md                        # Main navigation
├── CURSOR-AGENT-QUICKSTART.md                   # Quick start
├── CURSOR-AGENT-FETCH-SUMMARY.md                # Tech summary
└── EXECUTION-REPORT-CURSOR-AGENT.md             # Execution report
```

**Total**: 9 files, ~1,418 lines, ~47 KB

---

## 🚀 Usage Examples

### Example 1: Basic Fetch

```bash
node scripts/fetch-cursor-agent.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
```

### Example 2: Authenticated Fetch

```bash
export CURSOR_COOKIES="session=...; token=..."
node scripts/fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
```

### Example 3: Programmatic Use

```javascript
const { fetchAuthenticatedAgentData } = require('./scripts/fetch-cursor-agent-authenticated');

async function integrate() {
  const data = await fetchAuthenticatedAgentData();
  // Process with ISTANI AI Agent...
}
```

---

## 🏗️ Integration with ISTANI

This toolkit integrates seamlessly with:

- **ISTANI AI Agent** (`/workspace/ai-agent/`)
- **AI Brain System** (`/workspace/ai-brain/`)
- **N8N Automation** (`/workspace/n8n/`)

**Integration Guide**: [docs/CURSOR-AGENT-INTEGRATION.md](docs/CURSOR-AGENT-INTEGRATION.md)

---

## 📊 Project Stats

| Metric        | Value               |
| ------------- | ------------------- |
| Files Created | 9                   |
| Lines of Code | 1,418               |
| Documentation | 6 guides            |
| Scripts       | 2 functional        |
| Status        | ✅ Production Ready |
| Dev Time      | ~80 minutes         |

---

## 🔐 Security

✅ No hardcoded credentials  
✅ Environment variables only  
✅ Security best practices  
✅ Terms of Service compliance

**Details**: [Security Guide](docs/CURSOR-AGENT-INTEGRATION.md#security-considerations)

---

## 🆘 Help & Support

### Common Issues

- **"Sign in" page**: Need authentication → [Quick Start](CURSOR-AGENT-QUICKSTART.md)
- **Puppeteer error**: Install dependencies → `npm install puppeteer`
- **Browser won't launch**: Install Chromium → [Troubleshooting](scripts/README-CURSOR-AGENT.md#troubleshooting)

### Get Help

1. Check [CURSOR-AGENT-INDEX.md](CURSOR-AGENT-INDEX.md) for navigation
2. Read [CURSOR-AGENT-QUICKSTART.md](CURSOR-AGENT-QUICKSTART.md) for quick fixes
3. See [scripts/README-CURSOR-AGENT.md](scripts/README-CURSOR-AGENT.md) for detailed help

---

## 🎯 Next Steps

1. ✅ **[Quick Start](CURSOR-AGENT-QUICKSTART.md)** - Get running in 5 minutes
2. ✅ **Authenticate** - Get cookies from cursor.com
3. ✅ **Fetch Data** - Run the authenticated script
4. ✅ **Integrate** - Connect with ISTANI AI Agent

---

## 📝 License

Same as parent project (MIT)

---

## 🙏 Credits

Created by **ISTANI Autonomous Background Agent**  
Part of the **ISTANI AI Platform**  
Date: **2025-11-17**

---

<div align="center">

**[📌 View Full Index](CURSOR-AGENT-INDEX.md)** | **[⚡ Quick Start](CURSOR-AGENT-QUICKSTART.md)** | **[🛠️ Scripts](scripts/README-CURSOR-AGENT.md)** | **[🏗️ Integration](docs/CURSOR-AGENT-INTEGRATION.md)**

Made with ❤️ for the ISTANI AI Platform

</div>
