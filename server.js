const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Validate environment variables are loaded
const requiredEnvVars = ['SUPABASE_PROJECT_URL', 'SUPABASE_ANON_PUBLIC'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn('Warning: Missing environment variables:', missingVars.join(', '));
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'site')));

// Initialize Supabase client (only if credentials available)
let supabase = null;
if (process.env.SUPABASE_PROJECT_URL && process.env.SUPABASE_ANON_PUBLIC) {
  supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_ANON_PUBLIC);
}

// Security: Sanitize output to prevent API key leakage
function sanitizeOutput(text) {
  if (typeof text !== 'string') return text;

  const patterns = [
    /sk-[a-zA-Z0-9]{20,}/g,
    /sk_[a-zA-Z0-9]{40,}/g,
    /sb_[a-zA-Z0-9_-]{20,}/g,
    /ghp_[a-zA-Z0-9]{36,}/g,
    /prj_[a-zA-Z0-9]{20,}/g,
    /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g
  ];

  let sanitized = text;
  patterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
}

// Security: Detect prompt injection attempts
function detectPromptInjection(text) {
  const injectionPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/i,
    /disregard\s+(previous|above|all)\s+instructions?/i,
    /forget\s+(previous|above|all)\s+instructions?/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[SYSTEM\]/i,
    /\<\|im_start\|\>/i,
    /\<\|im_end\|\>/i
  ];

  return injectionPatterns.some(pattern => pattern.test(text));
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: supabase !== null,
      openrouter: !!process.env.QWEN_CODER_32B_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY
    }
  });
});

// AI Chat endpoint with OpenRouter
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Security: Check for prompt injection
    if (detectPromptInjection(message)) {
      console.warn('Prompt injection attempt detected:', sanitizeOutput(message));
      return res.status(400).json({
        error: 'Invalid input detected',
        response: 'I cannot process requests that attempt to override my instructions.'
      });
    }

    // Use primary API key
    const apiKey = process.env.QWEN_CODER_32B_API_KEY || process.env.MISTRAL_SMALL_API_KEY;

    if (!apiKey) {
      // Return demo response if no API key
      return res.json({
        response: getDemoResponse(message),
        source: 'demo'
      });
    }

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'qwen/qwen-2.5-coder-32b-instruct',
        messages: [
          {
            role: 'system',
            content:
              context || 'You are an expert AI fitness coach providing science-backed advice.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://istani.org',
          'X-Title': 'Istani Fitness'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Security: Sanitize response
    const sanitizedResponse = sanitizeOutput(aiResponse);

    res.json({
      response: sanitizedResponse,
      source: 'ai',
      model: 'qwen-2.5-coder-32b'
    });
  } catch (error) {
    console.error('AI API error:', error.message);

    // Fallback to demo response
    res.json({
      response: getDemoResponse(req.body.message),
      source: 'demo',
      note: 'AI service temporarily unavailable'
    });
  }
});

// ElevenLabs integration endpoint
app.post('/api/elevenlabs/init', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'ElevenLabs service not configured',
        available: false
      });
    }

    res.json({
      available: true,
      agentId: 'fitness-coach',
      note: 'Voice agent ready'
    });
  } catch (error) {
    console.error('ElevenLabs error:', error.message);
    res.status(500).json({ error: 'ElevenLabs initialization failed' });
  }
});

// Supabase data endpoints
app.post('/api/users/progress', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { userId, workoutData } = req.body;

    const { data, error } = await supabase.from('workout_progress').insert([
      {
        user_id: userId,
        workout_data: workoutData,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { userId } = req.params;

    const { data, error } = await supabase
      .from('workout_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ progress: data });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Demo response function
function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('workout') || lowerMessage.includes('plan')) {
    return 'To create your personalized workout plan, I need: 1) Your goal (muscle gain, fat loss, strength, athletic performance), 2) Experience level (beginner, intermediate, advanced), 3) Training frequency (days per week), 4) Available equipment. Share these details and I will design a science-backed program using progressive overload and optimal training volume.';
  }

  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
    return 'Evidence-based nutrition guidelines: Protein 1.6-2.2g per kg bodyweight daily across 4-6 meals. Post-workout: consume protein and carbs within 2 hours. For fat loss: 300-500 calorie deficit. For muscle gain: 200-300 calorie surplus. Would you like me to calculate your specific macros?';
  }

  if (lowerMessage.includes('plateau') || lowerMessage.includes('stuck')) {
    return 'Breaking plateaus requires strategic manipulation: 1) Increase volume by 10-20% if under 20 sets per muscle, 2) Vary intensity (85-90% 1RM heavy, 60-70% 1RM light phases), 3) Change exercises every 4-6 weeks, 4) Take deload weeks (50% volume) every 4-6 weeks. Research shows varied training increases strength by 2-3%. Which area might be limiting your progress?';
  }

  return 'I can help with: Training programs, nutrition guidance, form coaching, progress optimization, and recovery strategies. What specific fitness topic would you like to explore?';
}

// Serve fitness page as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'site', 'fitness.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'site', 'fitness.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Istani Fitness API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
