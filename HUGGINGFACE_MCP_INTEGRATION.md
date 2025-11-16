# 🤗 Hugging Face MCP Server Integration

**Add Hugging Face capabilities to Claude Code via Model Context Protocol (MCP)**

---

## 🎯 Overview

This guide shows how to integrate the **Hugging Face MCP server** into Claude Code Desktop, enabling access to:

- 🤗 **Hugging Face Models** - Access 500k+ models directly
- 📊 **Datasets** - Browse and use HF datasets
- 🚀 **Inference API** - Run model inferences
- 💬 **Spaces** - Interact with HF Spaces
- 🔍 **Model Search** - Find the right model for your task

**100% FREE** - No API costs when using free Hugging Face tier

---

## 📋 Prerequisites

1. **Claude Code Desktop** installed
2. **Hugging Face Account** (free) - [Sign up here](https://huggingface.co/join)
3. **HF Access Token** - [Create token here](https://huggingface.co/settings/tokens)

---

## 🚀 Quick Setup

### Step 1: Get Your Hugging Face Token

```bash
# Visit: https://huggingface.co/settings/tokens
# Click: "New token"
# Name: "claude-code-mcp"
# Type: "Read" (or "Write" if you need to upload)
# Click: "Generate token"
# Copy the token (starts with "hf_...")
```

### Step 2: Add MCP Server to Claude Code Desktop

**Method 1: Via Claude Code CLI** (Recommended)

```bash
# Add Hugging Face MCP server
claude mcp add hf-mcp-server \
  -t http \
  https://huggingface.co/mcp?login

# Verify it was added
claude mcp list
```

**Method 2: Via Settings File** (Manual)

On macOS/Linux:
```bash
# Edit Claude Code settings
code ~/.config/claude-code/mcp-servers.json
```

On Windows:
```powershell
# Edit Claude Code settings
code %APPDATA%\claude-code\mcp-servers.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": [
        "-y",
        "@huggingface/mcp-server"
      ],
      "env": {
        "HF_TOKEN": "hf_your_token_here"
      }
    }
  }
}
```

### Step 3: Restart Claude Code Desktop

```bash
# Quit Claude Code completely
# Restart Claude Code Desktop

# Or via CLI:
claude code restart
```

### Step 4: Verify MCP Server

In Claude Code, you should now see:

```
Available MCP servers:
✅ huggingface - Hugging Face Model Context Protocol
```

---

## 🎨 What You Can Do

### 1. Search Hugging Face Models

```
"Find the best text-to-image models on Hugging Face"
"Search for sentiment analysis models"
"Show me the top vision transformer models"
```

Claude Code will use the HF MCP server to search and recommend models.

### 2. Access Model Information

```
"Get details about bert-base-uncased"
"Show me the model card for stable-diffusion-v1-5"
"What are the requirements for gpt2?"
```

### 3. Use Datasets

```
"List datasets for question answering"
"Get information about the IMDB dataset"
"Show me image classification datasets"
```

### 4. Run Inference

```
"Use distilbert-base-uncased to analyze this text: [your text]"
"Generate an image using stable-diffusion"
"Classify this image using vit-base-patch16-224"
```

### 5. Interact with Spaces

```
"Find Spaces for image generation"
"Show me gradio demos for text-to-speech"
"What Spaces are trending?"
```

---

## 🔧 Configuration Options

### Basic Configuration

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@huggingface/mcp-server"],
      "env": {
        "HF_TOKEN": "hf_your_token_here"
      }
    }
  }
}
```

### Advanced Configuration

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@huggingface/mcp-server"],
      "env": {
        "HF_TOKEN": "hf_your_token_here",
        "HF_HUB_CACHE": "/custom/cache/path",
        "HF_ENDPOINT": "https://huggingface.co",
        "HF_TIMEOUT": "30"
      }
    }
  }
}
```

### Configuration with Multiple MCP Servers

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@huggingface/mcp-server"],
      "env": {
        "HF_TOKEN": "hf_your_token_here"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}
```

---

## 🧪 Testing the Integration

### Test 1: Search for Models

In Claude Code chat:

```
User: "Search Hugging Face for GPT-2 models"

Claude: [Uses HF MCP server to search]
Found 1,234 models matching "GPT-2":

1. gpt2 (OpenAI)
   - Downloads: 5.2M
   - Task: Text Generation
   - License: MIT

2. distilgpt2 (Hugging Face)
   - Downloads: 2.1M
   - Task: Text Generation
   - License: Apache 2.0

...
```

### Test 2: Get Model Info

```
User: "Get details about bert-base-uncased"

Claude: [Uses HF MCP server]
Model: bert-base-uncased
Author: Google
Downloads: 15.3M
Task: Fill-Mask, Feature Extraction
Languages: English
License: Apache 2.0

Model Card:
BERT base model (uncased) pretrained on English...
```

### Test 3: Run Inference

```
User: "Use sentiment-analysis model to analyze: 'I love this product!'"

Claude: [Uses HF MCP + Inference API]
Sentiment Analysis Result:
Label: POSITIVE
Score: 0.9998
Model: distilbert-base-uncased-finetuned-sst-2-english
```

---

## 🔐 Security Best Practices

### 1. Token Security

```bash
# DO NOT commit tokens to git
echo "mcp-servers.json" >> .gitignore

# Use environment variables
export HF_TOKEN="hf_your_token_here"

# Or use a secrets manager
claude mcp add huggingface --env HF_TOKEN="$(secret-tool lookup service huggingface)"
```

### 2. Token Permissions

- ✅ Use **Read tokens** for search and inference
- ⚠️ Use **Write tokens** only if uploading models/datasets
- 🔒 Never share tokens publicly
- 🔄 Rotate tokens regularly

### 3. Rate Limiting

```json
{
  "mcpServers": {
    "huggingface": {
      "rateLimit": {
        "requests": 100,
        "per": "hour"
      }
    }
  }
}
```

---

## 🎯 Use Cases for ISTANI Fitness

### 1. Fitness AI Chatbot

```
User: "Find a conversational model for fitness coaching"

Claude: [Uses HF MCP]
Recommended models:
- facebook/blenderbot-400M-distill
- microsoft/DialoGPT-medium
- google/flan-t5-base

User: "Use DialoGPT to respond to: 'How many sets for muscle growth?'"

Claude: [Uses HF Inference API]
Response: "For optimal muscle growth, research suggests 3-5 sets per exercise...
```

### 2. Image Analysis

```
User: "Use a vision model to analyze this gym form photo"

Claude: [Uses HF MCP + vit-base-patch16-224]
Analysis:
- Posture: Good alignment
- Form: 85% correct
- Suggestions: Lower hips slightly
```

### 3. Nutrition Text Extraction

```
User: "Extract nutritional info from this food label image"

Claude: [Uses HF MCP + DETR or TrOCR]
Extracted:
- Calories: 250
- Protein: 20g
- Carbs: 30g
- Fat: 8g
```

### 4. Workout Plan Generation

```
User: "Generate a workout plan description using GPT-2"

Claude: [Uses HF MCP + gpt2]
Generated Workout Plan:
Week 1: Focus on compound movements...
```

---

## 📊 Available MCP Tools

Once integrated, Claude Code can use these HF MCP tools:

| Tool | Description | Example |
|------|-------------|---------|
| `search_models` | Search HF models | "Find BERT models" |
| `get_model` | Get model details | "Info on gpt2" |
| `search_datasets` | Search datasets | "Find QA datasets" |
| `get_dataset` | Get dataset info | "Details on IMDB" |
| `list_spaces` | List HF Spaces | "Show image gen Spaces" |
| `inference` | Run model inference | "Analyze sentiment" |
| `download_model` | Download model files | "Download bert-base" |
| `upload_model` | Upload to HF Hub | "Upload my model" |

---

## 🚨 Troubleshooting

### Issue 1: MCP Server Not Found

```bash
# Check if npm/npx is installed
npx --version

# If not, install Node.js
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: Download from nodejs.org

# Test HF MCP server manually
npx -y @huggingface/mcp-server
```

### Issue 2: Authentication Failed

```bash
# Verify your token
curl -H "Authorization: Bearer hf_your_token" \
  https://huggingface.co/api/whoami-v2

# If error, regenerate token at:
# https://huggingface.co/settings/tokens
```

### Issue 3: MCP Server Not Loading

```bash
# Check Claude Code logs
tail -f ~/.config/claude-code/logs/mcp.log

# Restart with verbose logging
claude code --log-level debug
```

### Issue 4: Rate Limit Exceeded

```bash
# Check rate limits
curl -H "Authorization: Bearer hf_your_token" \
  https://huggingface.co/api/rate-limit

# Upgrade to HF Pro for higher limits:
# https://huggingface.co/pricing
```

---

## 🌟 Advanced Integration

### Custom MCP Server for ISTANI

Create a custom MCP server that combines HF with ISTANI-specific features:

**`istani-mcp-server.js`**:

```javascript
#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

const server = new Server({
  name: 'istani-ai',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Tool 1: Analyze workout form
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'analyze_workout_form') {
    const { image_url } = request.params.arguments;

    // Use HF Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      },
      body: JSON.stringify({ inputs: image_url }),
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(await response.json()) }],
    };
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

**Add to Claude Code**:

```json
{
  "mcpServers": {
    "istani-ai": {
      "command": "node",
      "args": ["./istani-mcp-server.js"],
      "env": {
        "HF_TOKEN": "hf_your_token_here"
      }
    }
  }
}
```

---

## 📚 Resources

### Documentation
- **HF MCP Server**: https://huggingface.co/docs/mcp
- **MCP Protocol**: https://modelcontextprotocol.io
- **Claude Code MCP**: https://docs.claude.com/claude-code/mcp

### Tutorials
- HF Model Hub: https://huggingface.co/models
- HF Datasets: https://huggingface.co/datasets
- HF Inference API: https://huggingface.co/docs/api-inference

### Community
- HF Discord: https://hf.co/join/discord
- MCP GitHub: https://github.com/modelcontextprotocol

---

## ✅ Verification Checklist

- [ ] Node.js and npx installed
- [ ] Hugging Face account created
- [ ] HF access token generated
- [ ] MCP server added to Claude Code
- [ ] Claude Code restarted
- [ ] MCP server shows in available servers
- [ ] Test search command works
- [ ] Test model info command works
- [ ] Test inference command works (optional)

---

## 🎉 Success!

Once configured, you can use natural language to:

✅ **Search 500k+ models** - "Find the best image classifier"
✅ **Access datasets** - "Show me fitness datasets"
✅ **Run AI inference** - "Analyze this workout description"
✅ **Explore Spaces** - "Find Gradio demos for fitness"
✅ **Download models** - "Get BERT for local use"

**Your Claude Code now has direct access to the entire Hugging Face ecosystem! 🤗**

---

🤖 **Generated with Claude Code**
Co-Authored-By: Claude <noreply@anthropic.com>
