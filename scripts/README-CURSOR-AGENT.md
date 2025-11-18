# Cursor Agent Fetcher Scripts

This directory contains scripts for fetching and processing Cursor agent data.

## 📁 Scripts

### 1. `fetch-cursor-agent.js`

Basic fetcher that works without authentication (limited data).

**Usage**:

```bash
node fetch-cursor-agent.js [agent-id]

# Example
node fetch-cursor-agent.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
```

**Features**:

- Automatic fallback between Puppeteer and curl
- Basic metadata extraction
- JSON output

**Limitations**:

- Cannot access authenticated agent data
- Will capture sign-in page if auth required

---

### 2. `fetch-cursor-agent-authenticated.js`

Advanced fetcher with full authentication support.

**Usage**:

```bash
# With environment variable
export CURSOR_COOKIES="your-cookies-here"
node fetch-cursor-agent-authenticated.js [agent-id]

# Or with token
export CURSOR_AUTH_TOKEN="your-token"
node fetch-cursor-agent-authenticated.js [agent-id]

# Or inline
node fetch-cursor-agent-authenticated.js [agent-id] --cookies="your-cookies"
```

**Features**:

- Full authentication support (cookies + tokens)
- Screenshot capture for debugging
- Comprehensive data extraction
- Authentication status reporting
- Detailed error messages

**Requires**:

- Puppeteer installed: `npm install puppeteer`

---

## 🔐 How to Get Authentication Credentials

### Method 1: Browser Cookies (Recommended)

1. Sign in to https://cursor.com in your browser
2. Open DevTools (F12)
3. Go to: **Application** → **Cookies** → **cursor.com**
4. Copy all cookie values as a string: `name1=value1; name2=value2`
5. Export: `export CURSOR_COOKIES="your-cookies-here"`

### Method 2: API Token

1. Sign in to https://cursor.com
2. Open DevTools → **Network** tab
3. Look for API requests with `Authorization` header
4. Copy the Bearer token
5. Export: `export CURSOR_AUTH_TOKEN="your-token"`

---

## 📊 Output

### Files Created

**Location**: `/workspace/data/`

1. **Basic JSON**:

   ```
   cursor-agent-{agent-id}.json
   ```

2. **Authenticated JSON**:

   ```
   cursor-agent-{agent-id}-authenticated.json
   ```

3. **Screenshot** (debugging):
   ```
   cursor-agent-{agent-id}-screenshot.png
   ```

### JSON Structure

```json
{
  "title": "Agent Title",
  "url": "https://cursor.com/agents?selectedBcId=...",
  "authenticated": true,
  "timestamp": "2025-11-17T...",
  "metadata": {
    "description": "...",
    "og:title": "..."
  },
  "content": {
    "agentElements": [...],
    "relevantScripts": [...]
  },
  "rawText": "..."
}
```

---

## 🔧 Installation

### Prerequisites

- Node.js >= 18
- npm or yarn

### Setup

```bash
# Install dependencies
npm install puppeteer --save-dev

# Make scripts executable
chmod +x fetch-cursor-agent.js
chmod +x fetch-cursor-agent-authenticated.js

# Test basic fetcher
node fetch-cursor-agent.js

# Test authenticated fetcher (with auth)
export CURSOR_COOKIES="your-cookies"
node fetch-cursor-agent-authenticated.js
```

---

## 🔍 Troubleshooting

### Puppeteer Not Found

```bash
npm install puppeteer --save-dev
```

### Browser Won't Launch

```bash
# Install Chrome/Chromium
sudo apt-get install chromium-browser

# Or use puppeteer's bundled browser
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install puppeteer
```

### Still Getting "Sign In" Page

- Ensure cookies/token are valid
- Check if you're signed in to Cursor
- Verify cookie expiration
- Try refreshing authentication

### Permission Denied

```bash
chmod +x fetch-cursor-agent.js
chmod +x fetch-cursor-agent-authenticated.js
```

---

## 🔗 Integration

### With ISTANI AI Agent

```javascript
const { fetchAuthenticatedAgentData } = require('./fetch-cursor-agent-authenticated');

async function integrateWithISTANI() {
  const agentData = await fetchAuthenticatedAgentData();

  // Process with ISTANI AI Agent
  // ...
}
```

### With AI Brain

```bash
# Use in unified AI system
cd ../ai-brain
node unified.js "Analyze cursor agent data from ../data/cursor-agent-*.json"
```

---

## 📚 Documentation

See also:

- [Cursor Agent Integration Guide](../docs/CURSOR-AGENT-INTEGRATION.md)
- [Complete Summary](../CURSOR-AGENT-FETCH-SUMMARY.md)
- [ISTANI AI Agent README](../ai-agent/README.md)

---

## 🤝 Contributing

Improvements welcome! Please:

1. Test your changes
2. Update documentation
3. Follow existing code style
4. Add error handling

---

## 📄 License

Same as parent project (MIT)

---

**Last Updated**: 2025-11-17
