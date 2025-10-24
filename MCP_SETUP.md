# Hugging Face MCP Server Configuration

This repository includes configuration for the Hugging Face MCP (Model Context Protocol) server, enabling Claude Code to access Hugging Face models, datasets, and spaces.

## What's Configured

The `.mcp.json` file at the repo root configures:
- **hf-mcp-server**: Connects to Hugging Face's MCP server
- **URL**: https://huggingface.co/mcp
- **Auth**: OAuth (triggered on first use)

## Setup for Team Members

### Option 1: OAuth (Recommended)

Already configured! When you open this repo in Claude Code:
1. The MCP server will auto-detect from `.mcp.json`
2. On first use, you'll be prompted to authenticate with Hugging Face
3. Follow the OAuth flow to grant access

### Option 2: CLI Setup

```bash
claude mcp add hf-mcp-server -t http https://huggingface.co/mcp?login
```

Then restart Claude Code.

### Option 3: Token-Based (Local Only)

**⚠️ DO NOT COMMIT TOKENS TO GIT**

Add to your local Claude Code config (`~/.claude.json`):

```json
{
  "mcpServers": {
    "hf-mcp-server": {
      "type": "http",
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer ${HF_TOKEN}"
      }
    }
  }
}
```

Set environment variable:
```bash
export HF_TOKEN=your_token_here
```

## Verify Connection

```bash
claude mcp list
```

Should show:
```
hf-mcp-server: https://huggingface.co/mcp (HTTP) - ✓ Connected
```

## Available Capabilities

Once connected, Claude Code can:
- 🤖 Access Hugging Face models and run inference
- 📊 Query and analyze datasets
- 🚀 Interact with Spaces
- 📦 Browse model/dataset metadata
- 🔍 Search the Hugging Face Hub

## Project Token

Our Hugging Face token is already configured in:
- `.env.local` (local dev - gitignored)
- Vercel environment variables (production)

Token: `hf_375a2734baefa3f8ebeb28a1a9648a7be2f648da6189956afb1d6f52f3ba838c`

## Resources

- [Hugging Face MCP Docs](https://huggingface.co/docs/hub/hf-mcp-server)
- [Claude Code MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp)
- [MCP Server Registry](https://mcp.so/server/hf-mcp/huggingface)
