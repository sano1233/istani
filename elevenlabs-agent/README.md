# ElevenLabs Fitness Voice Agent

Complete voice-powered fitness assistant integrated with Istani Fitness platform.

## 🎯 Overview

An AI-powered voice agent that provides:

- **Personalized Fitness Coaching** (voice-based)
- **Workout Scheduling** (Google Calendar integration)
- **Nutrition Guidance** (science-based recommendations)
- **Progress Tracking** (connected to Istani platform)
- **Resource Access** (Google Drive fitness documents)

## 🤖 Supported AI Models (via OpenRouter)

Configure any of these models by setting the appropriate environment variable:

| Model                           | Environment Variable         | Use Case                |
| ------------------------------- | ---------------------------- | ----------------------- |
| **MiniMax M2**                  | `OR_KEY_MINIMAX_MINIMAX_M2`  | Fast, multilingual      |
| **Google Gemini Flash 1.5**     | `OR_KEY_GOOGLE_GEMINI_FLASH` | Quick responses         |
| **Anthropic Claude 3.5 Sonnet** | `OR_KEY_ANTHROPIC_CLAUDE`    | Deep reasoning          |
| **OpenAI GPT-4 Turbo**          | `OR_KEY_OPENAI_GPT4`         | Complex queries         |
| **Meta Llama 3.1 70B**          | `OR_KEY_LLAMA`               | Open-source             |
| **DeepSeek Coder**              | `OR_KEY_DEEPSEEK`            | Technical advice        |
| **Alibaba Qwen Max**            | `OR_KEY_QWEN`                | Alternative perspective |
| **Cohere Command R+**           | `OR_KEY_COHERE`              | RAG-optimized           |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd elevenlabs-agent
npm install
```

### 2. Configure Environment Variables

Create `.env` file:

```bash
# OpenRouter API Keys (get from https://openrouter.ai/keys)
OR_KEY_MINIMAX_MINIMAX_M2=sk-or-v1-your-key-here
OR_KEY_GOOGLE_GEMINI_FLASH=sk-or-v1-your-key-here
OR_KEY_ANTHROPIC_CLAUDE=sk-or-v1-your-key-here
OR_KEY_OPENAI_GPT4=sk-or-v1-your-key-here
OR_KEY_LLAMA=sk-or-v1-your-key-here
OR_KEY_DEEPSEEK=sk-or-v1-your-key-here
OR_KEY_QWEN=sk-or-v1-your-key-here
OR_KEY_COHERE=sk-or-v1-your-key-here

# Fallback if model-specific key not set
OPENROUTER_API_KEY=sk-or-v1-your-default-key

# Google APIs (optional, demo mode if not set)
GOOGLE_CALENDAR_API_KEY=your-calendar-api-key
GOOGLE_DRIVE_API_KEY=your-drive-api-key

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 3. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on `http://localhost:3000`

## 📡 API Endpoints

### POST `/chat`

Chat with AI fitness coach.

**Request:**

```json
{
  "prompt": "What's the best workout for muscle gain?",
  "model": "anthropic/claude-3.5-sonnet",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "response": "For muscle gain, focus on compound movements...",
  "model": "anthropic/claude-3.5-sonnet",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  }
}
```

### POST `/schedule`

Schedule workout via Google Calendar.

**Request:**

```json
{
  "title": "Upper Body Workout",
  "description": "Push day: chest, shoulders, triceps",
  "startTime": "2025-11-15T10:00:00Z",
  "duration": 90,
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Workout scheduled successfully",
  "eventId": "abc123",
  "eventLink": "https://calendar.google.com/event?eid=abc123"
}
```

### GET `/file/search?query=workout`

Search Google Drive for fitness resources.

**Response:**

```json
{
  "success": true,
  "files": [
    {
      "id": "1abc",
      "name": "Push Day Workout Plan.pdf",
      "type": "application/pdf"
    }
  ]
}
```

### GET `/file/:id`

Retrieve specific file from Google Drive.

**Response:**

```json
{
  "success": true,
  "file": {
    "id": "1abc",
    "name": "Push Day Workout Plan.pdf",
    "mimeType": "application/pdf"
  },
  "content": "base64-encoded-content"
}
```

### GET `/health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "Istani Fitness Agent Backend",
  "configuredModels": ["minimax/minimax-m2", "anthropic/claude-3.5-sonnet"],
  "endpoints": {
    "chat": "/chat",
    "schedule": "/schedule",
    "fileSearch": "/file/search",
    "fileGet": "/file/:id"
  }
}
```

## 🎙️ ElevenLabs Agent Setup

### 1. Login to ElevenLabs

Go to: https://elevenlabs.io/app/conversational-ai

### 2. Configure System Prompt

Set the agent's personality and capabilities:

```
You are an expert fitness coach with 15+ years of experience helping clients transform their bodies. You specialize in:

- Science-based workout programming
- Evidence-based nutrition guidance
- Injury prevention and form coaching
- Sustainable habit formation
- Goal setting and accountability

Always provide:
1. Clear, actionable advice
2. Scientific backing for recommendations
3. Personalized guidance based on user's goals
4. Motivation and encouragement
5. Safety-first approach

You have access to tools for:
- Scheduling workouts in their calendar
- Retrieving fitness documents and workout plans
- Logging their progress in the Istani Fitness platform

Contact for human coaching: istaniDOTstore@proton.me
Platform: https://istani-dpoolwes1-istanis-projects.vercel.app
```

### 3. Add HTTP Tools

In the ElevenLabs agent interface, add these tools:

#### Tool 1: Chat with AI Coach

- **Name**: `chat_fitness_ai`
- **Description**: "Get fitness advice, workout plans, or nutrition guidance"
- **Method**: POST
- **URL**: `https://your-server.com/chat`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "prompt": "{{user_question}}",
  "model": "anthropic/claude-3.5-sonnet"
}
```

#### Tool 2: Schedule Workout

- **Name**: `schedule_workout`
- **Description**: "Book a workout session in user's calendar"
- **Method**: POST
- **URL**: `https://your-server.com/schedule`
- **Body**:

```json
{
  "title": "{{workout_title}}",
  "description": "{{workout_description}}",
  "startTime": "{{start_time}}",
  "duration": {{duration_minutes}},
  "email": "{{user_email}}"
}
```

#### Tool 3: Search Fitness Resources

- **Name**: `search_resources`
- **Description**: "Find workout plans, meal guides, or exercise demonstrations"
- **Method**: GET
- **URL**: `https://your-server.com/file/search?query={{search_query}}`

#### Tool 4: Get Fitness Document

- **Name**: `get_document`
- **Description**: "Retrieve specific fitness document by ID"
- **Method**: GET
- **URL**: `https://your-server.com/file/{{file_id}}`

### 4. Embed Agent on Website

Add this code to your HTML:

```html
<!-- ElevenLabs Voice Agent Widget -->
<script>
  (function () {
    const agentId = 'YOUR_AGENT_ID'; // From ElevenLabs dashboard

    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.defer = true;

    script.onload = function () {
      if (window.ElevenLabsWidget) {
        window.ElevenLabsWidget.init({
          agentId: agentId,
          position: 'bottom-right',
          greeting: "Hi! I'm your AI fitness coach. How can I help you today?",
          avatar: 'https://your-site.com/coach-avatar.png',
        });
      }
    };

    document.head.appendChild(script);
  })();
</script>
```

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (every 90 days)
4. **Set up rate limiting** on production server
5. **Use HTTPS only** for production deployments
6. **Validate all inputs** on server side
7. **Monitor API usage** for anomalies

## 🚀 Deployment Options

### Option 1: Vercel Serverless Functions

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard.

### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Option 3: Heroku

```bash
# Create Heroku app
heroku create istani-fitness-agent

# Set environment variables
heroku config:set OR_KEY_MINIMAX_MINIMAX_M2=sk-or-v1-...

# Deploy
git push heroku main
```

### Option 4: VPS (DigitalOcean, AWS, etc.)

```bash
# Clone repo
git clone https://github.com/sano1233/istani.git
cd istani/elevenlabs-agent

# Install dependencies
npm install

# Set up PM2 for process management
npm install -g pm2
pm2 start server.js --name istani-agent

# Set up nginx reverse proxy
# Configure SSL with Let's Encrypt
```

## 🧪 Testing

### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What exercises build chest muscles?",
    "model": "anthropic/claude-3.5-sonnet"
  }'
```

### Test Schedule Endpoint

```bash
curl -X POST http://localhost:3000/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Leg Day",
    "startTime": "2025-11-15T10:00:00Z",
    "duration": 60
  }'
```

### Test Health Check

```bash
curl http://localhost:3000/health
```

## 📊 Monitoring & Analytics

Track agent performance:

```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Track chat requests
let chatCount = 0;
app.post('/chat', async (req, res) => {
  chatCount++;
  console.log(`Total chats: ${chatCount}`);
  // ... existing code
});
```

## 🆘 Troubleshooting

### "API key not configured" Error

**Solution**: Set the appropriate environment variable for your model.

```bash
export OR_KEY_ANTHROPIC_CLAUDE=sk-or-v1-your-key-here
```

### Google Calendar not working

**Solution**: Enable Google Calendar API and create credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Calendar API
3. Create API key
4. Set `GOOGLE_CALENDAR_API_KEY` environment variable

### Agent not responding

**Solution**: Check server logs and verify:

1. Server is running (`http://localhost:3000/health`)
2. Environment variables are set
3. Network connectivity to OpenRouter API
4. ElevenLabs tools are configured correctly

## 📞 Support

**Email**: istaniDOTstore@proton.me
**Platform**: https://istani-dpoolwes1-istanis-projects.vercel.app
**Donations**: https://buymeacoffee.com/istanifitn

## 📚 Additional Resources

- [OpenRouter API Docs](https://openrouter.ai/docs)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai)
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Drive API](https://developers.google.com/drive)

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**License**: MIT
**Author**: Istani Fitness Team
