/**
 * ElevenLabs Fitness Agent Backend Server
 *
 * Integrates with:
 * - OpenRouter (multiple AI models)
 * - Google Calendar (workout scheduling)
 * - Google Drive (fitness documents)
 * - Supabase (user data)
 *
 * Environment Variables Required:
 * - OR_KEY_MINIMAX_MINIMAX_M2=sk-or-v1-...
 * - OR_KEY_GOOGLE_GEMINI_FLASH=sk-or-v1-...
 * - OR_KEY_ANTHROPIC_CLAUDE=sk-or-v1-...
 * - OR_KEY_OPENAI_GPT4=sk-or-v1-...
 * - GOOGLE_CALENDAR_API_KEY
 * - GOOGLE_DRIVE_API_KEY
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenRouter API Configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model-specific API key mapping
const MODEL_API_KEYS = {
  'minimax/minimax-m2': process.env.OR_KEY_MINIMAX_MINIMAX_M2,
  'google/gemini-flash-1.5': process.env.OR_KEY_GOOGLE_GEMINI_FLASH,
  'anthropic/claude-3.5-sonnet': process.env.OR_KEY_ANTHROPIC_CLAUDE,
  'openai/gpt-4-turbo': process.env.OR_KEY_OPENAI_GPT4,
  'meta-llama/llama-3.1-70b': process.env.OR_KEY_LLAMA,
  'deepseek/deepseek-coder': process.env.OR_KEY_DEEPSEEK,
  'alibaba/qwen-max': process.env.OR_KEY_QWEN,
  'cohere/command-r-plus': process.env.OR_KEY_COHERE
};

// Fitness-oriented system prompt
const FITNESS_SYSTEM_PROMPT = `You are an expert fitness coach and nutritionist with 15+ years of experience. Your role is to:

1. **Provide Science-Based Advice**: All recommendations are backed by peer-reviewed research
2. **Personalize Guidance**: Tailor advice to user's goals, experience level, and preferences
3. **Focus on Sustainability**: Promote healthy, maintainable habits over quick fixes
4. **Track Progress**: Help users log workouts, meals, and measurements
5. **Schedule Workouts**: Book workout sessions via Google Calendar
6. **Retrieve Resources**: Access workout plans and meal guides from Google Drive

Key Areas:
- Workout Programming (strength, cardio, flexibility)
- Nutrition Planning (macros, meal timing, supplements)
- Form & Technique (injury prevention)
- Recovery & Sleep
- Goal Setting (weight loss, muscle gain, performance)
- Motivation & Accountability

Contact: istaniDOTstore@proton.me
Platform: https://istani-dpoolwes1-istanis-projects.vercel.app`;

/**
 * Chat endpoint - Route to appropriate OpenRouter model
 */
app.post('/chat', async (req, res) => {
  try {
    const { prompt, model = 'minimax/minimax-m2', conversationHistory = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get API key for specified model
    const apiKey = MODEL_API_KEYS[model] || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: `API key not configured for model: ${model}`,
        hint: `Set environment variable OR_KEY_${model.replace(/[\/\-\.]/g, '_').toUpperCase()}`
      });
    }

    // Build messages array
    const messages = [
      { role: 'system', content: FITNESS_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    // Call OpenRouter API
    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://istani-dpoolwes1-istanis-projects.vercel.app',
          'X-Title': 'Istani Fitness Agent'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    res.json({
      success: true,
      response: aiResponse,
      model,
      usage: response.data.usage
    });
  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Schedule workout via Google Calendar
 */
app.post('/schedule', async (req, res) => {
  try {
    const { title, description, startTime, duration = 60, email } = req.body;

    if (!title || !startTime) {
      return res.status(400).json({ error: 'Title and startTime are required' });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Google Calendar API integration
    const calendarEvent = {
      summary: title,
      description: description || 'Workout scheduled via Istani Fitness Agent',
      start: {
        dateTime: start.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: email ? [{ email }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    // In production, call actual Google Calendar API
    const calendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    if (!calendarApiKey) {
      console.warn('Google Calendar API key not configured');
      return res.json({
        success: true,
        message: 'Workout scheduled (demo mode)',
        event: calendarEvent
      });
    }

    // Call Google Calendar API
    const calendarResponse = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${calendarApiKey}`,
      calendarEvent
    );

    res.json({
      success: true,
      message: 'Workout scheduled successfully',
      eventId: calendarResponse.data.id,
      eventLink: calendarResponse.data.htmlLink
    });
  } catch (error) {
    console.error('Schedule error:', error.message);
    res.status(500).json({
      error: 'Failed to schedule workout',
      details: error.message
    });
  }
});

/**
 * Search Google Drive for fitness resources
 */
app.get('/file/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const driveApiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!driveApiKey) {
      console.warn('Google Drive API key not configured');
      return res.json({
        success: true,
        message: 'Search completed (demo mode)',
        files: [
          { id: 'demo1', name: 'Push Day Workout Plan.pdf', type: 'application/pdf' },
          { id: 'demo2', name: 'Meal Prep Guide.pdf', type: 'application/pdf' }
        ]
      });
    }

    // Call Google Drive API
    const searchResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files?q=name contains '${query}'&key=${driveApiKey}`
    );

    res.json({
      success: true,
      files: searchResponse.data.files
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      error: 'Failed to search files',
      details: error.message
    });
  }
});

/**
 * Get specific file from Google Drive
 */
app.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const driveApiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!driveApiKey) {
      return res.json({
        success: true,
        message: 'File retrieved (demo mode)',
        fileId: id,
        content: 'Demo file content would appear here'
      });
    }

    // Get file metadata
    const metadataResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${id}?key=${driveApiKey}`
    );

    // Get file content
    const contentResponse = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${driveApiKey}`,
      { responseType: 'arraybuffer' }
    );

    res.json({
      success: true,
      file: metadataResponse.data,
      content: Buffer.from(contentResponse.data).toString('base64')
    });
  } catch (error) {
    console.error('File retrieval error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve file',
      details: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const configuredModels = Object.entries(MODEL_API_KEYS)
    .filter(([_, key]) => key)
    .map(([model]) => model);

  res.json({
    status: 'healthy',
    service: 'Istani Fitness Agent Backend',
    configuredModels,
    endpoints: {
      chat: '/chat',
      schedule: '/schedule',
      fileSearch: '/file/search',
      fileGet: '/file/:id'
    },
    contact: 'istaniDOTstore@proton.me'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏋️ Istani Fitness Agent Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💪 Contact: istaniDOTstore@proton.me`);
});

module.exports = app;
