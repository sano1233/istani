# Cursor Agent Integration - Quick Start Guide

**Agent ID**: `bc-371b6b86-5cff-40fb-922b-af0f42218c24`

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (30 seconds)

```bash
cd /workspace
npm install puppeteer --save-dev
```

### Step 2: Get Authentication (2 minutes)

1. Open https://cursor.com in your browser
2. Sign in with your account
3. Press **F12** to open DevTools
4. Go to **Application** → **Cookies** → **cursor.com**
5. Copy all cookies as a string (e.g., `session=abc; token=xyz`)

### Step 3: Set Environment Variable (10 seconds)

```bash
export CURSOR_COOKIES="paste-your-cookies-here"
```

### Step 4: Run Fetcher (30 seconds)

```bash
node scripts/fetch-cursor-agent-authenticated.js bc-371b6b86-5cff-40fb-922b-af0f42218c24
```

### Step 5: View Results (1 minute)

```bash
# View JSON data
cat data/cursor-agent-bc-371b6b86-5cff-40fb-922b-af0f42218c24-authenticated.json | jq

# View screenshot
xdg-open data/cursor-agent-bc-371b6b86-5cff-40fb-922b-af0f42218c24-screenshot.png
```

## ✅ That's It!

You now have:
- ✅ Cursor agent data in JSON format
- ✅ Screenshot of the agent page
- ✅ Authentication working
- ✅ Ready to integrate with ISTANI AI Agent

## 🎯 Next Steps

### Option A: Analyze the Data

```bash
# Use with ISTANI AI Agent
cd ai-agent
npm run cli process --cursor-data ../data/cursor-agent-*.json
```

### Option B: Automate Fetching

```bash
# Add to crontab for periodic updates
echo "0 * * * * cd /workspace && node scripts/fetch-cursor-agent-authenticated.js" | crontab -
```

### Option C: Integrate with Your System

```javascript
const { fetchAuthenticatedAgentData } = require('./scripts/fetch-cursor-agent-authenticated');

async function yourFunction() {
  const data = await fetchAuthenticatedAgentData();
  // Process data...
}
```

## 📚 Full Documentation

- **Integration Guide**: [`docs/CURSOR-AGENT-INTEGRATION.md`](docs/CURSOR-AGENT-INTEGRATION.md)
- **Complete Summary**: [`CURSOR-AGENT-FETCH-SUMMARY.md`](CURSOR-AGENT-FETCH-SUMMARY.md)
- **Script Documentation**: [`scripts/README-CURSOR-AGENT.md`](scripts/README-CURSOR-AGENT.md)

## 🆘 Having Issues?

### "Puppeteer not found"
```bash
npm install puppeteer --save-dev
```

### "Still getting Sign In page"
- Verify your cookies are correct
- Check if you're signed in at cursor.com
- Try getting fresh cookies

### "Browser won't launch"
```bash
sudo apt-get install chromium-browser
```

## 💡 Pro Tips

1. **Save cookies in .env file**:
   ```bash
   echo "CURSOR_COOKIES='your-cookies'" >> .env
   ```

2. **Use with different agents**:
   ```bash
   node scripts/fetch-cursor-agent-authenticated.js <different-agent-id>
   ```

3. **Automate with n8n**:
   - Check the n8n workflows in `/workspace/n8n/`
   - Integrate agent fetching into automation pipelines

---

**Ready to go?** Run the commands above and you'll have Cursor agent data in less than 5 minutes! 🎉
