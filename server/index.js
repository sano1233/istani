import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fetch from 'node-fetch';

dotenv.config();

/**
 * ENVIRONMENT
 */
const {
  PORT = 4000,
  OLLAMA_BASE_URL = 'http://localhost:11434',
  OLLAMA_MODEL = 'qwen2.5',
  MASTODON_BASE_URL,
  MASTODON_ACCESS_TOKEN,
} = process.env;

const app = express();

// Configure CORS - update allowed origins for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Set CORS_ORIGIN in .env for production
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

/**
 * In-memory storage (demo only)
 * Replace with Supabase / Postgres later if you want persistence.
 */
let bookings = [];
let socialPosts = [];

/**
 * ––––– OLLAMA (LOCAL LLM) INTEGRATION –––––
 *
 * Requires Ollama running on your machine:
 * https://ollama.com
 * ollama pull qwen2.5
 * ollama serve
 */
async function callOllamaChat(userMessage, contextMessages = []) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a concise business AI assistant. You help with bookings, social posts, and basic Q&A. Answer clearly in simple language.',
    },
    ...contextMessages
      .filter((m) => m && m.text)
      .map((m) => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama error: ${res.status} ${res.statusText} ${text || ''}`.trim());
  }

  const data = await res.json();

  const reply = data?.message?.content;
  if (!reply || typeof reply !== 'string') {
    throw new Error('Ollama response missing message.content');
  }

  return reply.trim();
}

/**
 * ––––– SIMPLE FALLBACK AI –––––
 */
function fakeAIReply(message) {
  if (!message || !message.trim()) {
    return 'I did not catch that. Can you repeat your question?';
  }

  const lower = message.toLowerCase();

  if (lower.includes('hours') || lower.includes('open')) {
    return 'We are open Monday to Friday from 9 AM to 5 PM.';
  }

  if (lower.includes('book') || lower.includes('appointment')) {
    return 'Tell me the date and time you want, and I will try to book it for you.';
  }

  if (lower.includes('post') || lower.includes('social')) {
    return 'You can write your social post in the dashboard and I will schedule it for you.';
  }

  return 'I am your AI business assistant. I can help with bookings, social posts, and basic questions.';
}

/**
 * ––––– MASTODON INTEGRATION –––––
 */
function canPostToMastodon() {
  return Boolean(MASTODON_BASE_URL && MASTODON_ACCESS_TOKEN);
}

async function postToMastodon({ content, scheduledAt }) {
  if (!canPostToMastodon()) {
    throw new Error('Mastodon env vars are not configured.');
  }

  const base = MASTODON_BASE_URL.replace(/\/$/, '');
  const url = `${base}/api/v1/statuses`;

  const params = new URLSearchParams();
  params.append('status', content);

  if (scheduledAt) {
    const iso = new Date(scheduledAt).toISOString();
    params.append('scheduled_at', iso);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MASTODON_ACCESS_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error || data?.message || `${res.status} ${res.statusText}` || 'Unknown error';
    throw new Error('Mastodon post failed: ' + msg);
  }

  const id = data.id || data.status?.id || null;
  const urlResult = data.url || data.status?.url || null;

  return {
    id,
    url: urlResult,
    raw: data,
  };
}

/**
 * ––––– ROUTES –––––
 */

// AI Chat endpoint (Ollama + fallback)
app.post('/api/ask', async (req, res) => {
  const { message, context } = req.body || {};
  console.log('[/api/ask] incoming:', { message });

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const reply = await callOllamaChat(message, Array.isArray(context) ? context : []);
    return res.json({
      reply,
      metadata: {
        source: 'ollama',
        model: OLLAMA_MODEL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Ollama failed, using fallback:', err.message);
    const reply = fakeAIReply(message);
    return res.json({
      reply,
      metadata: {
        source: 'fallback-fake-ai',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Social posting endpoint (Mastodon + in-memory log)
app.post('/api/post-social', async (req, res) => {
  const { content, platform = 'mastodon', scheduledAt } = req.body || {};

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required.' });
  }

  const postRecord = {
    id: socialPosts.length + 1,
    content: content.trim(),
    platform,
    scheduledAt: scheduledAt || null,
    createdAt: new Date().toISOString(),
    remote: null,
  };

  try {
    if (platform === 'mastodon' && canPostToMastodon()) {
      const result = await postToMastodon({
        content: content.trim(),
        scheduledAt,
      });
      postRecord.remote = {
        provider: 'mastodon',
        id: result.id,
        url: result.url,
      };
      console.log('[/api/post-social] Mastodon posted:', result);
    } else {
      console.log(
        '[/api/post-social] Stored locally only (no Mastodon env or non-mastodon platform).',
      );
    }

    socialPosts.push(postRecord);

    return res.json({
      success: true,
      post: postRecord,
    });
  } catch (err) {
    console.error('Error posting social:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Availability endpoint (static sample for now)
app.get('/api/availability', (_req, res) => {
  const slots = [
    { id: 1, start: '2025-01-01T09:00:00', end: '2025-01-01T09:30:00' },
    { id: 2, start: '2025-01-01T10:00:00', end: '2025-01-01T10:30:00' },
    { id: 3, start: '2025-01-01T14:00:00', end: '2025-01-01T14:30:00' },
  ];

  res.json({ slots });
});

// Booking endpoint (in-memory)
app.post('/api/book', (req, res) => {
  const { name, email, slotId } = req.body || {};

  if (!name || !slotId) {
    return res.status(400).json({ error: 'Name and slotId are required to book.' });
  }

  // Basic email validation if provided
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
  }

  const booking = {
    id: bookings.length + 1,
    name,
    email: email || null,
    slotId,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  console.log('[/api/book] new booking:', booking);

  res.json({ success: true, booking });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * ––––– CRON: DAILY SUMMARY –––––
 * Runs every day at 18:00 server time.
 */
cron.schedule('0 18 * * *', () => {
  console.log('========== DAILY SUMMARY ==========');
  console.log('Bookings:', bookings.length);
  console.log('Social posts:', socialPosts.length);
  console.log('===================================');
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Ollama base URL: ${OLLAMA_BASE_URL}`);
  if (canPostToMastodon()) {
    console.log(`Mastodon posting enabled for ${MASTODON_BASE_URL}`);
  } else {
    console.log('Mastodon posting NOT configured (env vars missing).');
  }
});
