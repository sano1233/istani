# 🎙️ ElevenLabs Voice Assistant Integration

## Overview

Istani Fitness includes a **24/7 AI voice assistant** powered by ElevenLabs Conversational AI. The assistant provides hands-free workout logging, nutrition tracking, fitness coaching, and calendar scheduling through natural voice interactions.

---

## 🤖 Agent Configuration

### Agent Details

- **Name**: Istani Fitness Agent
- **Voice**: Eric (ElevenLabs default)
- **Timezone**: Europe/Bucharest
- **Language Detection**: Enabled (automatic)
- **Availability**: 24/7 autonomous operation

### System Prompt

```
You are the Istani Fitness AI assistant, operating 24/7 to help users with their fitness journey. You can:

- Answer fitness, nutrition, and training questions
- Log workouts and track progress
- Schedule training sessions in Google Calendar
- Search and retrieve fitness resources from Google Drive
- Provide personalized coaching advice
- Perform research on exercise science topics

Always be encouraging, motivating, and science-based in your responses. Maintain high accuracy and cite sources when providing scientific information.
```

### First Message

```
Welcome to Istani Fitness! 🏋️ I'm your 24/7 AI fitness coach. I can help you log workouts, track nutrition, schedule training sessions, and answer any fitness questions. How can I assist you today?
```

---

## 🛠️ Tools Configured

### 1. fitness_chat
- **Endpoint**: `/chat`
- **Purpose**: General fitness conversations and AI responses
- **Models Supported**: 8+ OpenRouter models

### 2. schedule_event
- **Endpoint**: `/schedule`
- **Purpose**: Create Google Calendar events
- **Features**: Workout scheduling, coach appointments

### 3. file_search
- **Endpoint**: `/file/search`
- **Purpose**: Search Google Drive for fitness resources
- **Use Cases**: Workout plans, meal plans, progress reports

### 4. file_get
- **Endpoint**: `/file/{id}`
- **Purpose**: Retrieve specific files by ID
- **Use Cases**: Download workout PDFs, meal plans

---

## 📦 Backend Server

### Location

The backend server is located in:
```
elevenlabs-agent/
├── server.js          # Express.js server with all endpoints
├── package.json       # Dependencies
└── README.md         # Setup instructions
```

### Features

- **Multi-Model Support**: 8 OpenRouter AI models
- **Google Calendar Integration**: OAuth-based scheduling
- **Google Drive Integration**: File search and retrieval
- **Environment-Based Config**: Flexible model selection
- **Error Handling**: Comprehensive logging

### Supported AI Models

1. **MiniMax M2** (default) - Fast responses
2. **Google Gemini 2.0 Flash** - Experimental features
3. **Anthropic Claude 3.5 Sonnet** - Advanced reasoning
4. **OpenAI GPT-4O** - High quality
5. **Meta Llama 3.3 70B** - Open source
6. **DeepSeek V3** - Specialized coding
7. **Alibaba Qwen 2.5 72B** - Multilingual
8. **Cohere Command R7B** - Fast inference

---

## 🚀 Deployment Steps

### 1. Deploy Backend Server

```bash
cd elevenlabs-agent

# Install dependencies
npm install

# Set environment variables (see below)
# Deploy to your preferred platform:
# - Railway: railway up
# - Heroku: git push heroku main
# - Vercel: vercel --prod
# - DigitalOcean: standard node deployment
```

### 2. Environment Variables (Backend)

Create `.env` in `elevenlabs-agent/`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# OpenRouter API Keys (at least one required)
OR_KEY_MINIMAX_MINIMAX_M2=your_openrouter_key_here
OR_KEY_GOOGLE_GEMINI_2=your_openrouter_key_here
OR_KEY_ANTHROPIC_CLAUDE=your_openrouter_key_here
OR_KEY_OPENAI_GPT4O=your_openrouter_key_here
OR_KEY_META_LLAMA=your_openrouter_key_here
OR_KEY_DEEPSEEK_V3=your_openrouter_key_here
OR_KEY_QWEN=your_openrouter_key_here
OR_KEY_COHERE=your_openrouter_key_here

# Google OAuth (for Calendar & Drive)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend-url.com/oauth/callback

# Google API Credentials (Service Account)
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
```

### 3. Configure Google OAuth

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: "Istani Fitness"

2. **Enable APIs**:
   - Google Calendar API
   - Google Drive API

3. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://your-backend-url.com/oauth/callback`

4. **Copy Credentials**:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### 4. Get OpenRouter API Keys

1. Visit [OpenRouter](https://openrouter.ai)
2. Sign up / Log in
3. Go to API Keys section
4. Create new API key
5. Copy key to environment variables

**Note**: You only need ONE OpenRouter key - use it for all models by setting all `OR_KEY_*` variables to the same key.

### 5. Configure ElevenLabs Agent

1. **Go to ElevenLabs Dashboard**:
   - Visit [ElevenLabs ConvAI](https://elevenlabs.io/app/conversational-ai)

2. **Get Agent ID**:
   - Click on your agent
   - Copy Agent ID from URL or settings

3. **Configure Tools** (already done based on your message):
   - ✅ fitness_chat → `https://your-backend-url.com/chat`
   - ✅ schedule_event → `https://your-backend-url.com/schedule`
   - ✅ file_search → `https://your-backend-url.com/file/search`
   - ✅ file_get → `https://your-backend-url.com/file/{id}`

4. **Set Authentication**: OFF (public agent)

### 6. Add to Next.js App

Add to Vercel environment variables:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_from_dashboard
```

The widget is already integrated in `app/layout.tsx` and will appear on all pages.

---

## 🧪 Testing

### Test Backend Endpoints

```bash
# Test chat endpoint
curl -X POST https://your-backend-url.com/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What are the best exercises for chest?", "model": "minimax/minimax-m2"}'

# Test scheduling
curl -X POST https://your-backend-url.com/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Chest & Triceps Workout",
    "start": "2025-11-12T18:00:00Z",
    "end": "2025-11-12T19:00:00Z"
  }'

# Test file search
curl "https://your-backend-url.com/file/search?q=workout+plan"
```

### Test Voice Assistant

1. Visit `https://istani.org`
2. Look for ElevenLabs widget (bottom right corner)
3. Click microphone icon
4. Say: "Schedule a workout for tomorrow at 6 PM"
5. Verify calendar event created

---

## 🎨 Widget Customization

### Custom Styling

Add to `app/globals.css`:

```css
/* ElevenLabs Widget Customization */
elevenlabs-convai {
  /* Position */
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  z-index: 9999 !important;

  /* Size */
  --widget-size: 60px;

  /* Colors (match Istani brand) */
  --primary-color: #FF6B35;
  --secondary-color: #004E89;
  --accent-color: #06D6A0;
}

/* Hide widget on mobile if desired */
@media (max-width: 768px) {
  elevenlabs-convai {
    bottom: 16px !important;
    right: 16px !important;
    --widget-size: 48px;
  }
}
```

### Advanced Configuration

Edit `components/voice-assistant.tsx`:

```typescript
<elevenlabs-convai
  agent-id={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}

  // Optional: Custom settings
  initial-text="Need fitness help? Click to chat!"
  language="en"
  theme="light"
  position="bottom-right"
/>
```

---

## 📊 Usage Analytics

### Track Conversations

ElevenLabs provides built-in analytics:
- Total conversations
- Average conversation duration
- User satisfaction ratings
- Most asked questions

Access via: [ElevenLabs Dashboard → Analytics](https://elevenlabs.io/app/conversational-ai)

### Custom Analytics (Optional)

Add event tracking in `components/voice-assistant.tsx`:

```typescript
useEffect(() => {
  window.addEventListener('elevenlabs:conversation:start', () => {
    // Track conversation start
    console.log('Voice conversation started')
  })

  window.addEventListener('elevenlabs:conversation:end', () => {
    // Track conversation end
    console.log('Voice conversation ended')
  })
}, [])
```

---

## 🔐 Security

### API Key Protection

- ✅ Backend keys stored in environment variables
- ✅ Not exposed to frontend
- ✅ HTTPS required for all endpoints
- ✅ Rate limiting recommended

### OAuth Security

- ✅ OAuth tokens stored server-side only
- ✅ Refresh tokens used for long-term access
- ✅ Scopes limited to Calendar & Drive read/write

### Agent Security

- ✅ Agent is public (no authentication required)
- ✅ No sensitive user data in conversations
- ✅ All personal data stored in Supabase (not ElevenLabs)

---

## 🐛 Troubleshooting

### Widget Not Appearing

1. **Check Agent ID**:
   ```bash
   # Verify environment variable is set
   echo $NEXT_PUBLIC_ELEVENLABS_AGENT_ID
   ```

2. **Check Console**:
   - Open browser DevTools
   - Look for ElevenLabs script errors

3. **Verify Script Loading**:
   ```typescript
   // Add to voice-assistant.tsx
   script.onload = () => console.log('ElevenLabs loaded')
   script.onerror = () => console.error('ElevenLabs failed to load')
   ```

### Backend Not Responding

1. **Check Server Status**:
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **View Logs**:
   ```bash
   # Railway
   railway logs

   # Heroku
   heroku logs --tail

   # Vercel
   vercel logs
   ```

3. **Verify Environment Variables**:
   ```bash
   # Check all keys are set
   env | grep OR_KEY
   env | grep GOOGLE
   ```

### Calendar Events Not Creating

1. **Verify OAuth Setup**:
   - Check redirect URI matches exactly
   - Ensure Calendar API is enabled

2. **Test OAuth Flow**:
   ```bash
   # Visit in browser
   https://your-backend-url.com/oauth/authorize
   ```

3. **Check Permissions**:
   - Calendar: Read/Write events
   - Drive: Read files and metadata

---

## 🚀 Production Checklist

Before going live:

- [ ] Backend deployed and accessible via HTTPS
- [ ] All environment variables set (Next.js + Backend)
- [ ] ElevenLabs agent ID configured
- [ ] Google OAuth credentials configured
- [ ] Calendar API enabled
- [ ] Drive API enabled
- [ ] Test all 4 tools (chat, schedule, search, get)
- [ ] Widget appears on istani.org
- [ ] Voice conversations working
- [ ] Calendar events creating successfully
- [ ] Error logging configured
- [ ] Rate limiting implemented (optional)

---

## 🎯 Usage Examples

### For Users

**Example 1: Log Workout**
> User: "I just did 4 sets of bench press with 80kg"
> Agent: "Great work! I've logged your bench press workout. 4 sets at 80kg is solid progress!"

**Example 2: Schedule Training**
> User: "Schedule my leg day for Friday at 7 AM"
> Agent: "Done! I've added 'Leg Day' to your calendar for Friday at 7:00 AM."

**Example 3: Nutrition Question**
> User: "How much protein should I eat?"
> Agent: "Based on your profile, aim for 150-170g of protein daily. This supports muscle growth and recovery."

**Example 4: Find Resources**
> User: "Find my meal plan"
> Agent: "I found your meal plan in Google Drive. Would you like me to summarize it?"

---

## 🔄 Future Enhancements

### Planned Features

1. **User Context Awareness**:
   - Access user's Supabase profile
   - Personalized responses based on goals
   - Progress-aware coaching

2. **Workout Logging**:
   - Direct database writes
   - Real-time progress updates
   - Streak notifications

3. **Voice Commands**:
   - "Show my progress"
   - "Start workout timer"
   - "Log today's weight"

4. **Multi-Language Support**:
   - Automatic language detection
   - Localized responses
   - Regional fitness advice

### Integration Roadmap

- [ ] Supabase direct integration
- [ ] Stripe subscription management
- [ ] Wearable device sync
- [ ] Video form analysis
- [ ] Meal photo recognition
- [ ] Progress photo analysis

---

## 📞 Support

### ElevenLabs Issues

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs Support](https://elevenlabs.io/support)

### Backend Issues

- Check `elevenlabs-agent/README.md`
- Review server logs
- Contact: istaniDOTstore@proton.me

### General Questions

- Platform: https://istani.org
- Email: istaniDOTstore@proton.me

---

## 📝 Summary

Your Istani Fitness platform now includes:

✅ **24/7 Voice Assistant** - ElevenLabs ConvAI
✅ **Multi-Model AI Backend** - 8 OpenRouter models
✅ **Google Calendar Integration** - Automated scheduling
✅ **Google Drive Integration** - Resource management
✅ **Hands-Free Operation** - Voice-based interactions
✅ **Always Available** - No human intervention needed
✅ **Scalable Architecture** - Production-ready deployment

**The fitness platform is now fully autonomous with voice AI capabilities!** 🎉
