# AI Platform - Full-Stack Business Assistant

A complete, free, and open-source AI platform with local LLM integration (Ollama) and optional Mastodon social media posting.

## Features

- **AI Chat**: Conversational AI powered by Ollama (local LLM) with fallback to rule-based responses
- **Voice Assistant**: Browser-based voice interaction using Web Speech API
- **Social Automation**: Schedule and post to Mastodon with optional scheduling
- **Booking System**: Manage appointments and time slots
- **Daily Summaries**: Automated cron job for daily reports
- **No API Keys Required**: Works out of the box without external services (except optional Mastodon)

## Architecture

```
ai-platform/
├── server/          # Express backend with Ollama + Mastodon integration
│   ├── index.js     # Main server file
│   ├── package.json
│   └── .env         # Configuration (not in git)
└── client/          # Vite + React frontend
    ├── src/
    │   ├── App.jsx      # Main dashboard
    │   ├── main.jsx     # React entry point
    │   └── styles.css   # Modern dark theme
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** (for local LLM) - Install from https://ollama.com

### Installation

1. **Install Ollama and pull a model:**
   ```bash
   # Install Ollama from https://ollama.com
   ollama pull qwen2.5
   # or use another model like llama3, mistral, etc.
   ollama serve
   ```

2. **Configure the backend:**
   ```bash
   cd server
   # Edit .env file with your settings
   # Default Ollama URL: http://localhost:11434
   # Optional: Add Mastodon credentials for real social posting
   ```

3. **Start the backend:**
   ```bash
   cd server
   npm run dev
   # Server will run on http://localhost:4000
   ```

4. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   # Frontend will run on http://localhost:5173
   ```

5. **Open your browser:**
   Navigate to http://localhost:5173

## Configuration

### Backend (.env)

```env
# Server
PORT=4000

# Ollama (local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5

# Mastodon (optional - for real social posting)
MASTODON_BASE_URL=https://mastodon.social
MASTODON_ACCESS_TOKEN=your_access_token_here
```

### Mastodon Setup (Optional)

To enable real Mastodon posting:

1. Create a Mastodon account on any instance (e.g., mastodon.social)
2. Go to Settings > Development > New Application
3. Copy your access token
4. Add `MASTODON_BASE_URL` and `MASTODON_ACCESS_TOKEN` to `server/.env`

**Without Mastodon configuration**: Posts are stored in-memory only (demo mode).

## API Endpoints

### Backend Server (http://localhost:4000)

- `POST /api/ask` - AI chat with context support
  - Body: `{ message: string, context?: Array }`
  - Returns: `{ reply: string, metadata: object }`

- `POST /api/post-social` - Create/schedule social media post
  - Body: `{ content: string, platform?: string, scheduledAt?: string }`
  - Returns: `{ success: boolean, post: object }`

- `GET /api/availability` - Get available time slots
  - Returns: `{ slots: Array }`

- `POST /api/book` - Book an appointment
  - Body: `{ name: string, email?: string, slotId: number }`
  - Returns: `{ success: boolean, booking: object }`

- `GET /health` - Health check
  - Returns: `{ status: string, time: string }`

## How It Works

### AI Chat Flow

1. User sends a message via the frontend
2. Frontend sends POST to `/api/ask` with message and conversation context
3. Backend tries Ollama first:
   - Calls Ollama's `/api/chat` endpoint
   - Sends conversation history for context
   - Returns AI-generated response
4. If Ollama fails (not running, connection error):
   - Falls back to rule-based responses
   - Uses keyword matching for common questions
5. Frontend displays the response
6. For voice mode: Browser speaks the response using Text-to-Speech

### Social Posting Flow

1. User writes content in the Social Automation tab
2. Optionally sets a scheduled time
3. Frontend sends POST to `/api/post-social`
4. Backend checks if Mastodon is configured:
   - **Yes**: Posts to Mastodon API (immediate or scheduled)
   - **No**: Stores in-memory only (demo mode)
5. Returns success with optional Mastodon URL

### Booking Flow

1. Frontend fetches available slots from `/api/availability`
2. User selects a slot and enters details
3. Frontend sends POST to `/api/book`
4. Backend stores booking in-memory
5. Returns confirmation

## Voice Features

The voice assistant uses browser-based Web Speech API:

- **Speech Recognition**: Converts your voice to text
- **Text-to-Speech**: Reads AI responses aloud
- **No external APIs**: Runs entirely in the browser
- **Best support**: Chrome/Edge on desktop

## Customization

### Change the AI Model

Edit `server/.env`:
```env
OLLAMA_MODEL=llama3
# or mistral, codellama, etc.
```

Then pull the model:
```bash
ollama pull llama3
```

### Add Persistence

The current implementation uses in-memory storage. To add persistence:

1. Install a database client (e.g., `pg` for PostgreSQL)
2. Replace the `bookings` and `socialPosts` arrays
3. Add database connection in `server/index.js`

Example with Supabase:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Replace in-memory storage with database calls
```

### Customize the UI

Edit `client/src/styles.css` to change:
- Color scheme (CSS variables in `:root`)
- Layout and spacing
- Typography and fonts

### Add More Social Platforms

Extend `server/index.js`:
```javascript
async function postToTwitter({ content }) {
  // Implement Twitter API integration
}

// In POST /api/post-social:
if (platform === "twitter") {
  await postToTwitter({ content });
}
```

## Troubleshooting

### Ollama Connection Issues

**Error**: "Ollama error: ECONNREFUSED"
- **Solution**: Make sure Ollama is running (`ollama serve`)
- Check `OLLAMA_BASE_URL` in `.env` matches your Ollama instance

### Voice Not Working

**Error**: "Voice not supported in this browser"
- **Solution**: Use Chrome or Edge on desktop
- Safari and Firefox have limited Web Speech API support

### Mastodon Posting Fails

**Error**: "Mastodon post failed: 401 Unauthorized"
- **Solution**: Check your `MASTODON_ACCESS_TOKEN` is valid
- Ensure token has `write:statuses` permission
- Verify `MASTODON_BASE_URL` is correct (no trailing slash)

### Port Already in Use

**Error**: "EADDRINUSE: address already in use"
- **Solution**: Change `PORT` in `server/.env` or kill the process using that port

## Development

### Backend Development

```bash
cd server
npm run dev
# Auto-restarts on file changes if you add nodemon
```

### Frontend Development

```bash
cd client
npm run dev
# Hot module replacement enabled
```

### Build for Production

```bash
cd client
npm run build
# Creates optimized build in client/dist/

cd server
# Set NODE_ENV=production in .env
# Use a process manager like PM2:
pm2 start index.js --name ai-platform-server
```

## Future Enhancements

- [ ] Add database persistence (PostgreSQL/Supabase)
- [ ] User authentication and multi-user support
- [ ] Google Calendar integration for real availability
- [ ] More social platforms (Twitter/X, LinkedIn, Bluesky)
- [ ] Email notifications for bookings
- [ ] Admin dashboard for managing bookings
- [ ] Analytics and reporting
- [ ] Mobile app with React Native
- [ ] Voice commands for booking and social posting
- [ ] AI-generated social media content suggestions

## Tech Stack

**Backend:**
- Express.js - Web framework
- Ollama - Local LLM inference
- Mastodon API - Social media posting
- node-cron - Scheduled tasks
- node-fetch - HTTP requests

**Frontend:**
- React 18 - UI framework
- Vite - Build tool and dev server
- Web Speech API - Voice recognition and synthesis
- CSS3 - Modern dark theme with gradients

## License

MIT License - Feel free to use this for personal or commercial projects.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review Ollama docs: https://ollama.com/docs

## Credits

Built with ❤️ using free and open-source technologies.
