# AI Coding Assistant Setup Guide

This repository is configured to use multiple AI coding assistants through Claude Code with intelligent routing.

## 🤖 Available AI Models

### Qwen 3 Coder Plus (Primary)
- **Purpose**: Advanced code generation, refactoring, and analysis
- **Strengths**: Deep code understanding, complex refactoring, multi-language support
- **Use via**: `@qwen-analyzer` skill or automatic routing

### Gemini 2.0 Flash (Long Context)
- **Purpose**: Large codebase analysis, architectural overviews
- **Strengths**: 1M+ token context window, pattern detection, comprehensive analysis
- **Use via**: `@gemini-analyzer` skill or automatic routing for long context tasks

## 📦 Installation

All tools are already installed in this project:

```bash
# Qwen CLI (v0.2.3)
npm install -g @qwen-code/qwen-code

# Gemini CLI (v0.17.1)
npm install -g @google/gemini-cli

# Claude Code Router
npm install -g @musistudio/claude-code-router
```

## 🔑 API Key Setup

### Option 1: Local Development

Create a `.env` file in your home directory or project root:

```bash
# ~/.env or .env in project root
export QWEN_API_KEY="your_qwen_api_key_here"
export GEMINI_API_KEY="your_gemini_api_key_here"

# Load in your shell
source ~/.env
```

### Option 2: Shell Profile

Add to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
export QWEN_API_KEY="your_qwen_api_key_here"
export GEMINI_API_KEY="your_gemini_api_key_here"
```

### Option 3: GitHub Actions (Already Configured)

API keys are stored as repository secrets:
- `qwen_apikey`
- `gemini_api_key`

## 🚀 Starting the Router

The Claude Code Router intelligently routes requests to the best AI model based on the task:

```bash
# Start the router server
ccr start

# Check status
ccr status

# Use Claude Code with routing
claude-code

# Stop the router
ccr stop
```

### Router Configuration

Located at `~/.claude-code-router/config.json`:

```json
{
  "Router": {
    "default": "qwen,qwen-coder-plus",      // Standard coding tasks
    "background": "qwen,qwen-coder-plus",   // Background processing
    "think": "qwen,qwen-coder-plus",        // Complex reasoning
    "longContext": "gemini,gemini-2.0-flash-exp"  // Large file analysis
  }
}
```

## 🎯 Using the Skills

### Qwen Analyzer Skill

For advanced code generation and refactoring:

```
@qwen-analyzer

Request: "Refactor this authentication module to use modern TypeScript patterns with proper error handling"
```

**Best for:**
- Code refactoring and modernization
- Bug analysis and fixing
- Performance optimization
- Test generation
- Complex algorithm implementation
- Design pattern implementation

### Gemini Analyzer Skill

For large-scale codebase analysis:

```
@gemini-analyzer

Request: "Analyze the entire codebase architecture and identify all authentication patterns"
```

**Best for:**
- Architectural overviews
- Pattern detection across codebase
- Dependency analysis
- Security vulnerability scanning
- Code quality analysis
- Technology stack mapping

## 💡 Example Workflows

### 1. Refactor Legacy Code

```
@qwen-analyzer

"Modernize this JavaScript class to TypeScript with proper typing, convert to functional components with hooks, and add error boundaries"
```

### 2. Analyze Project Architecture

```
@gemini-analyzer

"Provide a comprehensive architectural overview of this Next.js application, including component hierarchy, state management patterns, and API structure"
```

### 3. Generate Tests

```
@qwen-analyzer

"Generate comprehensive Jest tests for the user authentication module including unit tests, integration tests, and edge cases"
```

### 4. Find Security Issues

```
@gemini-analyzer

"Scan the entire codebase for security vulnerabilities including XSS, SQL injection, authentication issues, and insecure dependencies"
```

## ⚙️ Advanced Configuration

### Maximum Token Usage

Both models support high token limits for comprehensive responses:

**Qwen CLI:**
```bash
qwen --model qwen-coder-plus --max-tokens 4000 -p "Your prompt here"
```

**Gemini CLI:**
```bash
gemini --all-files --yolo -p "Your prompt here"
```

### Reasoning Mode (Qwen)

For complex problem-solving with visible reasoning:

```javascript
const response = await client.chat.completions.create({
  model: "qwen-coder-plus",
  messages: [{ role: "user", content: "Design a scalable microservices architecture" }],
  extra_body: {
    include_reasoning: true,
    thinking_budget: 1024
  }
});
```

### Tool Calling (Qwen)

For agentic workflows with function calling:

```javascript
const response = await openai.chat.completions.create({
  model: 'qwen-coder-plus',
  messages: [{ role: 'user', content: 'What files are in my project?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path' }
        }
      }
    }
  }]
});
```

## 🔍 Monitoring Usage

The router provides detailed logging and status:

```bash
# View router status
ccr status

# Check logs (when LOG: true in config)
ccr ui  # Opens web UI with logs and metrics
```

## 🛠️ Troubleshooting

### Router not starting
```bash
# Check if port is in use
ccr stop
ccr start
```

### API key errors
```bash
# Verify environment variables are set
echo $QWEN_API_KEY
echo $GEMINI_API_KEY

# Reload your shell profile
source ~/.bashrc  # or ~/.zshrc
```

### Model not responding
```bash
# Check router configuration
cat ~/.claude-code-router/config.json

# Verify API endpoints
curl -H "Authorization: Bearer $QWEN_API_KEY" https://dashscope.aliyuncs.com/compatible-mode/v1/models
```

## 📚 Additional Resources

- **Qwen Documentation**: https://help.aliyun.com/zh/dashscope/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Claude Code Docs**: https://github.com/anthropics/claude-code
- **Router GitHub**: https://github.com/musistudio/claude-code-router

## 🎓 Best Practices

1. **Use the right tool for the job**:
   - Qwen for code generation and refactoring
   - Gemini for large-scale analysis

2. **Be specific in prompts**:
   - Include context about language, framework, and requirements
   - Specify desired output format
   - Request explanations alongside code

3. **Leverage maximum tokens**:
   - Use high token limits for comprehensive responses
   - Break down very large tasks into smaller chunks

4. **Monitor costs**:
   - Check API usage regularly
   - Use the router UI to track token consumption

5. **Security**:
   - Never commit API keys to version control
   - Use environment variables or secrets management
   - Rotate keys periodically
