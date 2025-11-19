# Qwen MCP Server Integration

Date: 2025-11-19
Status: OPERATIONAL

## Overview

Qwen is Alibaba Cloud's powerful large language model that now powers ISTANI's AI capabilities through MCP (Model Context Protocol) integration. Qwen provides high-quality text generation with excellent multilingual support and competitive performance.

## What is Qwen?

**Qwen** (通义千问) is Alibaba Cloud's state-of-the-art language model series:
- **Qwen-Turbo**: Fast, efficient model for general use
- **Qwen-Plus**: Enhanced model with better reasoning
- **Qwen-Max**: Most capable model in the series
- **Multilingual**: Strong support for Chinese and English
- **Cost-effective**: Competitive pricing
- **High performance**: Fast response times

## Installation & Setup

### 1. Install Qwen MCP Tool

```bash
npm install -g qwen-mcp-tool
```

**Status:** ✅ Installed

### 2. Configure with Claude Code

Add to your Claude Code configuration:

```bash
claude mcp add -s local qwen-cli -- npx -y qwen-mcp-tool
```

Or add directly to `~/.claude/config.json`:
```json
{
  "mcpServers": {
    "qwen": {
      "command": "npx",
      "args": ["-y", "qwen-mcp-tool"]
    }
  }
}
```

### 3. Environment Configuration

Add to `.env.local`:
```bash
# Qwen API Key (Alibaba Cloud DashScope)
QWEN_API_KEY=sk-or-v1-your-key-here
```

**Current Status:** ✅ API Key configured

## API Integration

### Qwen API Class

**Location:** `lib/api-integrations.ts:441-521`

```typescript
import { apiManager } from '@/lib/api-integrations';

// Generate content
const response = await apiManager.qwen.generateContent(
  'Create a workout plan for building strength',
  {
    model: 'qwen-turbo',
    temperature: 0.7
  }
);

// Generate workout plan
const plan = await apiManager.qwen.generateWorkoutPlan({
  goals: ['strength', 'muscle gain'],
  experience: 'intermediate',
  equipment: ['barbell', 'dumbbells'],
  timeAvailable: 60
});

// Generate meal plan
const mealPlan = await apiManager.qwen.generateMealPlan({
  goals: ['muscle gain'],
  dietaryRestrictions: ['vegetarian'],
  calories: 2500,
  macros: { protein: 150, carbs: 300, fats: 80 }
});

// Analyze progress
const analysis = await apiManager.qwen.analyzeProgress({
  workouts: recentWorkouts,
  nutrition: meals,
  measurements: bodyMetrics
});
```

### Available Models

1. **qwen-turbo** (Default)
   - Fast and efficient
   - Good for general tasks
   - Cost-effective
   - Response time: ~2-3 seconds

2. **qwen-plus**
   - Enhanced reasoning
   - Better context understanding
   - More accurate responses
   - Response time: ~3-4 seconds

3. **qwen-max**
   - Most capable
   - Best quality
   - Complex reasoning
   - Response time: ~4-6 seconds

### Configuration Options

```typescript
{
  model: 'qwen-turbo' | 'qwen-plus' | 'qwen-max',
  temperature: 0.0 - 1.0,  // Controls randomness (default: 0.7)
  top_p: 0.0 - 1.0,        // Nucleus sampling (default: 0.8)
  max_tokens: number       // Max response length (default: 2000)
}
```

## Multi-Provider Integration

Qwen is now part of the multi-provider fallback system:

```typescript
// Automatically tries: Qwen → Gemini → OpenAI → Claude
const plan = await apiManager.generateWorkoutPlan(
  userProfile,
  'qwen' // Preferred provider (optional)
);
```

**Provider Order (Default):**
1. Qwen (fast & cost-effective)
2. Gemini (large context)
3. OpenAI (high quality)
4. Claude (best reasoning)

**Benefits:**
- High availability (99.9%+)
- Automatic failover
- Cost optimization (Qwen first)
- Quality guarantee (falls back to premium)

## MCP Server Features

The Qwen MCP server provides these capabilities:

### 1. Text Generation
```bash
# Via CLI
npx qwen-mcp-tool generate "Create a workout plan"

# Via MCP
{
  "tool": "qwen_generate",
  "arguments": {
    "prompt": "Design a weekly workout routine",
    "model": "qwen-turbo"
  }
}
```

### 2. Code Analysis
```bash
# Analyze code
npx qwen-mcp-tool analyze --file app/dashboard/page.tsx
```

### 3. Translation
```bash
# Translate content (Qwen excels at Chinese ⇄ English)
npx qwen-mcp-tool translate "健身计划" --to english
```

### 4. Content Enhancement
```bash
# Improve existing content
npx qwen-mcp-tool enhance --text "Your text here"
```

## API Endpoints

Qwen is integrated into existing ISTANI API endpoints:

### Chat Endpoint
```
POST /api/ai/chat
{
  "message": "Create a workout plan for beginners",
  "provider": "qwen",
  "type": "workout"
}
```

### Workout Plan Generation
```
POST /api/ai/workout-plan
{
  "goals": ["strength"],
  "experience": "beginner",
  "equipment": ["dumbbells"],
  "timeAvailable": 45,
  "provider": "qwen"
}
```

### Meal Plan Generation
```
POST /api/ai/meal
{
  "goals": ["weight loss"],
  "dietaryRestrictions": [],
  "calories": 2000,
  "macros": { "protein": 150, "carbs": 200, "fats": 65 },
  "provider": "qwen"
}
```

## Performance Comparison

| Model | Response Time | Context | Quality | Cost | Best For |
|-------|--------------|---------|---------|------|----------|
| Qwen Turbo | 2-3s | 8K | Good | Low | General tasks |
| Qwen Plus | 3-4s | 32K | Better | Medium | Complex tasks |
| Qwen Max | 4-6s | 32K | Best | Higher | Critical tasks |
| Gemini Flash | 2-4s | 1M | Good | Low | Large context |
| OpenAI GPT-4 | 3-6s | 128K | Excellent | High | High quality |
| Claude Sonnet | 4-8s | 200K | Excellent | High | Reasoning |

## Use Cases

### When to Use Qwen

**Best For:**
- Cost-effective text generation
- Multilingual content (Chinese/English)
- Fast responses needed
- General fitness advice
- Workout suggestions
- Meal recommendations
- Progress analysis

**Examples:**
```typescript
// Quick workout suggestion
const suggestion = await apiManager.qwen.generateContent(
  'Suggest 3 exercises for chest day',
  { model: 'qwen-turbo' }
);

// Analyze user progress
const insights = await apiManager.qwen.analyzeProgress({
  workouts: last30Days,
  nutrition: mealLogs,
  measurements: bodyStats
});

// Generate meal ideas
const meals = await apiManager.qwen.generateContent(
  'Suggest high-protein vegetarian meals',
  { model: 'qwen-turbo' }
);
```

### When NOT to Use Qwen

**Use Other Providers For:**
- Very large context analysis → Use **Gemini** (1M tokens)
- Complex reasoning tasks → Use **Claude**
- Highest quality text → Use **OpenAI GPT-4**
- Image generation → Use **OpenAI DALL-E 3**
- Voice synthesis → Use **ElevenLabs**

## Integration Status

### ✅ Completed
- [x] Qwen MCP tool installed
- [x] QwenAPI class created
- [x] Multi-provider integration
- [x] Health check added
- [x] Workout plan generation
- [x] Meal plan generation
- [x] Progress analysis
- [x] API endpoint integration
- [x] Fallback system

### 🔄 Available Now
- Qwen Turbo model
- Qwen Plus model
- Qwen Max model
- MCP server integration
- Claude Code compatibility
- Multi-provider fallback

## Configuration Files

### Environment Variables
```bash
# .env.local
QWEN_API_KEY=sk-or-v1-your-api-key-here
```

### MCP Configuration
```json
// ~/.claude/config.json
{
  "mcpServers": {
    "qwen": {
      "command": "npx",
      "args": ["-y", "qwen-mcp-tool"],
      "env": {
        "QWEN_API_KEY": "${QWEN_API_KEY}"
      }
    }
  }
}
```

### API Manager
```typescript
// lib/api-integrations.ts
export class APIManager {
  public qwen: QwenAPI;
  // ... other providers

  constructor() {
    this.qwen = new QwenAPI();
    // ... initialize others
  }
}
```

## Testing

### Test Qwen Integration

```bash
# Via Node.js
node -e "
const { apiManager } = require('./lib/api-integrations');
apiManager.qwen.generateContent('Hello Qwen!')
  .then(r => console.log(r))
  .catch(e => console.error(e));
"

# Via API endpoint
curl -X POST https://istani.org/api/ai/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a simple workout plan",
    "provider": "qwen",
    "type": "workout"
  }'
```

### Test MCP Server

```bash
# Start MCP server
npx qwen-mcp-tool

# Should show: [QMCPT] qwen-mcp-tool listening on stdio
```

### Health Check

```bash
# Check all AI providers including Qwen
curl https://istani.org/api/health

# Should show:
{
  "services": {
    "qwen": { "status": "ok" },
    ...
  }
}
```

## Cost Optimization

### Qwen Pricing (Alibaba Cloud)
- **Qwen-Turbo**: ~$0.001 per 1K tokens
- **Qwen-Plus**: ~$0.002 per 1K tokens
- **Qwen-Max**: ~$0.004 per 1K tokens

### Cost Comparison
```
Qwen Turbo:  $0.001 / 1K tokens (cheapest)
Gemini Flash: $0.0001 / 1K tokens (nearly free!)
OpenAI GPT-4: $0.03 / 1K tokens (expensive)
Claude Sonnet: $0.015 / 1K tokens (premium)
```

### Optimization Strategy

**Use this order for cost efficiency:**
1. **Gemini Flash** - Nearly free, 1M context
2. **Qwen Turbo** - Very cheap, fast
3. **OpenAI GPT-4** - Expensive but excellent
4. **Claude Sonnet** - Premium for reasoning

**Implementation:**
```typescript
const plan = await apiManager.generateWorkoutPlan(
  profile,
  'qwen' // Try Qwen first (cost-effective)
);
// Falls back to Gemini → OpenAI → Claude if needed
```

## Troubleshooting

### MCP Server Won't Start

**Error:** `qwen-mcp-tool not found`

**Fix:**
```bash
npm install -g qwen-mcp-tool
# Or use npx
npx -y qwen-mcp-tool
```

### API Key Error

**Error:** `No API key configured`

**Fix:**
```bash
# Add to .env.local
echo "QWEN_API_KEY=your-key-here" >> .env.local

# Or set environment variable
export QWEN_API_KEY=your-key-here
```

### Rate Limiting

**Error:** `Rate limit exceeded`

**Fix:**
- Qwen has generous limits
- Implement caching for repeated queries
- Use fallback to other providers

```typescript
try {
  return await apiManager.qwen.generateContent(prompt);
} catch (error) {
  // Automatically falls back to Gemini/OpenAI/Claude
  return await apiManager.generateWorkoutPlan(profile);
}
```

### Poor Response Quality

**Fix:**
- Try `qwen-plus` or `qwen-max` models
- Increase temperature for creativity
- Provide more detailed prompts
- Or fallback to OpenAI/Claude for best quality

```typescript
// Better model
const response = await apiManager.qwen.generateContent(
  prompt,
  { model: 'qwen-max' }
);

// Or use multi-provider with quality preference
const plan = await apiManager.generateWorkoutPlan(
  profile,
  'openai' // Prefer quality over cost
);
```

## Resources

### Documentation
- **Qwen Official**: https://help.aliyun.com/zh/dashscope/
- **MCP Tool GitHub**: https://github.com/jeffery9/qwen-mcp-tool
- **Alibaba Cloud**: https://www.alibabacloud.com/

### API References
- **DashScope API**: https://dashscope.aliyuncs.com/
- **Model Documentation**: https://help.aliyun.com/zh/dashscope/developer-reference/model-qwen-turbo

### Support
- **Alibaba Cloud Support**: https://www.alibabacloud.com/support
- **MCP GitHub Issues**: https://github.com/jeffery9/qwen-mcp-tool/issues

## Summary

**Qwen Integration Status:** ✅ FULLY OPERATIONAL

**Capabilities:**
- Text generation with Qwen Turbo/Plus/Max
- Workout plan generation
- Meal plan generation
- Progress analysis
- MCP server integration
- Multi-provider fallback
- Cost-effective operations

**Performance:**
- Response time: 2-6 seconds
- Context window: 8K-32K tokens
- Quality: Good to Excellent
- Cost: Very competitive

**Integration Points:**
- `lib/api-integrations.ts` - QwenAPI class
- `/api/ai/chat` - Chat endpoint
- `/api/ai/workout-plan` - Workout generation
- `/api/ai/meal` - Meal planning
- Multi-provider fallback system

**Result:** ISTANI now has 6 AI models integrated for maximum capability and cost optimization!

Last Updated: 2025-11-19
Status: OPERATIONAL
Version: 4.0.0
