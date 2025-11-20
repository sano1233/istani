# MCP Servers and Docker Gateway Configuration

This document describes the Model Context Protocol (MCP) server configuration and Docker Gateway setup for the ISTANI project.

## Overview

The MCP configuration enables Cursor to interact with various MCP servers including:
- **Hugging Face MCP Server** - Access to 500k+ models, datasets, and inference APIs
- **Docker MCP Gateway** - Gateway service for MCP protocol communication
- **Filesystem MCP Server** - File system access within workspace
- **GitHub MCP Server** - GitHub repository integration

## Configuration Files

### `.cursor/mcp.json`

The main MCP configuration file located at `.cursor/mcp.json` contains all MCP server definitions. This file uses environment variables for secure token management.

**Location**: `/workspace/.cursor/mcp.json`

**Configuration**:
```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@huggingface/mcp-server"],
      "env": {
        "HF_TOKEN": "${HF_TOKEN}"
      }
    },
    "docker-gateway": {
      "url": "http://localhost:8080",
      "transport": "sse"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Environment Variables

### Required Environment Variables

The following environment variables must be set for the MCP servers to function:

#### `HF_TOKEN`
- **Description**: Hugging Face access token for API authentication
- **How to get**: 
  1. Visit https://huggingface.co/settings/tokens
  2. Click "New token"
  3. Name: "istani-mcp"
  4. Type: "Read" (or "Write" if uploading models)
  5. Copy the token (starts with "hf_...")
- **Usage**: Used by Hugging Face MCP server for model access and inference

#### `GITHUB_TOKEN`
- **Description**: GitHub personal access token for repository access
- **How to get**:
  1. Visit https://github.com/settings/tokens
  2. Click "Generate new token (classic)"
  3. Select scopes: `repo`, `read:org` (as needed)
  4. Copy the token (starts with "ghp_...")
- **Usage**: Used by GitHub MCP server for repository operations

### Setting Environment Variables

#### For Local Development

Create or update `.env.local` in the project root:

```bash
# Hugging Face Token
HF_TOKEN=hf_your_token_here

# GitHub Token (if not already set)
GITHUB_TOKEN=ghp_your_token_here
```

#### For Docker Services

Environment variables are automatically passed to Docker services via `docker-compose.yml`. Ensure they are set in your shell environment or in a `.env` file in the `ai-agent/` directory:

```bash
# In ai-agent/.env or export in shell
export HF_TOKEN=hf_your_token_here
export GITHUB_TOKEN=ghp_your_token_here
```

## Docker Gateway Service

The MCP Gateway service runs as a Docker container and provides a gateway interface for MCP protocol communication.

### Service Configuration

**Location**: `ai-agent/docker-compose.yml`

**Service Details**:
- **Container Name**: `istani-mcp-gateway`
- **Base Image**: `node:20-alpine`
- **Port**: `8080`
- **Restart Policy**: `unless-stopped`
- **Network**: `ai-agent-network`
- **Note**: The gateway installs and runs the MCP gateway package on startup. If the package name or setup differs, adjust the `command` section in `docker-compose.yml`.

### Starting the Gateway

```bash
# Navigate to ai-agent directory
cd ai-agent

# Start the MCP gateway service
docker-compose up -d mcp-gateway

# Check service status
docker-compose ps mcp-gateway

# View logs
docker-compose logs -f mcp-gateway
```

### Health Check

The gateway includes a health check endpoint:
- **URL**: `http://localhost:8080/health`
- **Check Interval**: 30 seconds
- **Timeout**: 10 seconds

## Integration with Cline Unified

The MCP configuration works alongside the Cline unified setup in `ai-brain/unified.js`. The MCP servers provide additional context and capabilities to the AI agents.

### Available MCP Tools

Once configured, the following MCP tools are available:

#### Hugging Face MCP
- `search_models` - Search Hugging Face models
- `get_model` - Get model details
- `search_datasets` - Search datasets
- `get_dataset` - Get dataset information
- `list_spaces` - List HF Spaces
- `inference` - Run model inference
- `download_model` - Download model files

#### GitHub MCP
- Repository access and operations
- Issue and PR management
- Code search and analysis

#### Filesystem MCP
- File system operations within `/workspace`
- File reading and writing
- Directory navigation

## Security Considerations

### Token Security

1. **Never commit tokens to git**: The `.cursor/mcp.json` file is excluded from git via `.gitignore`
2. **Use environment variables**: All tokens are referenced via environment variables, not hardcoded
3. **Token permissions**: Use minimal required permissions (Read tokens for most use cases)
4. **Token rotation**: Rotate tokens regularly for security

### Docker Security

- The MCP gateway runs in an isolated Docker network (`ai-agent-network`)
- Environment variables are securely injected at runtime
- Health checks ensure service availability

## Troubleshooting

### MCP Server Not Found

```bash
# Verify npx is available
npx --version

# Test Hugging Face MCP server manually
npx -y @huggingface/mcp-server

# Test GitHub MCP server
npx -y @modelcontextprotocol/server-github
```

### Authentication Failed

```bash
# Verify HF token
curl -H "Authorization: Bearer $HF_TOKEN" \
  https://huggingface.co/api/whoami-v2

# Verify GitHub token
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```

### Docker Gateway Not Starting

```bash
# Check Docker service logs
docker-compose logs mcp-gateway

# Verify environment variables are set
docker-compose config | grep HF_TOKEN
docker-compose config | grep GITHUB_TOKEN

# If the MCP gateway package doesn't exist, you may need to:
# 1. Build a custom Docker image with the gateway
# 2. Use an alternative MCP gateway implementation
# 3. Adjust the command in docker-compose.yml

# Restart the service
docker-compose restart mcp-gateway
```

**Note**: If `@modelcontextprotocol/gateway` package doesn't exist, you may need to:
- Create a custom Dockerfile for the MCP gateway
- Use a different MCP gateway implementation
- Remove the docker-gateway entry from `.cursor/mcp.json` if not needed

### Gateway Connection Issues

```bash
# Test gateway health endpoint
curl http://localhost:8080/health

# Check if port is in use
lsof -i :8080

# Verify network connectivity
docker network inspect ai-agent_ai-agent-network
```

## Verification Checklist

- [ ] `HF_TOKEN` environment variable is set
- [ ] `GITHUB_TOKEN` environment variable is set (if using GitHub MCP)
- [ ] `.cursor/mcp.json` file exists and is properly configured
- [ ] Docker MCP Gateway service is running (`docker-compose ps mcp-gateway`)
- [ ] Gateway health check passes (`curl http://localhost:8080/health`)
- [ ] Cursor can access MCP servers (check Cursor MCP status)
- [ ] Test Hugging Face MCP: Search for a model
- [ ] Test Filesystem MCP: Access workspace files
- [ ] Test GitHub MCP: Access repository (if configured)

## Additional Resources

- **Hugging Face MCP**: https://huggingface.co/docs/mcp
- **MCP Protocol**: https://modelcontextprotocol.io
- **MCP Gateway**: https://github.com/modelcontextprotocol/gateway
- **Cursor MCP Docs**: Check Cursor documentation for MCP integration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review MCP server logs in Cursor
3. Check Docker gateway logs: `docker-compose logs mcp-gateway`
4. Verify environment variables are correctly set
