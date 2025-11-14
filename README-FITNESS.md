# Istani Fitness Platform

Science-backed fitness training powered by advanced AI integrations.

## Features

### AI-Powered Coaching
- 15+ AI models integrated via OpenRouter
- Personalized workout plan generation
- Real-time form analysis and corrections
- Nutrition optimization and macro tracking
- 24/7 intelligent customer support via ElevenLabs

### Science-Based Programs
1. Strength and Hypertrophy Training
   - Progressive overload protocols
   - Volume optimization (10-20 sets per muscle per week)
   - Periodized training phases
   - 6-12 reps at 70-85% 1RM

2. Metabolic Fat Loss
   - Caloric deficit optimization (500kcal per day)
   - Muscle-sparing resistance training
   - HIIT and LISS cardio integration
   - Protein timing (1.6-2.2g per kg bodyweight)

3. Athletic Performance
   - Plyometric progressions
   - Olympic lift variations
   - Speed and agility protocols
   - Sport-specific conditioning

4. Mobility and Recovery
   - Dynamic mobility routines
   - Myofascial release techniques
   - Active recovery protocols
   - Sleep optimization

### Nutrition Science
- Protein optimization (1.6-2.2g per kg)
- Nutrient timing strategies
- Hydration protocols (3-4 liters daily)
- Micronutrient tracking (25+ vitamins)

### Technology Stack

**Frontend**
- HTML5, CSS3 with iOS-inspired design system
- Vanilla JavaScript with modern ES6+
- Responsive design for all devices

**Backend**
- Node.js with Express
- Supabase for database and authentication
- OpenRouter API (15+ AI models)
- ElevenLabs voice AI agent

**AI Models Integrated**
- Qwen 2.5 Coder 32B Instruct
- Mistral Small 24B Instruct
- Hermes 3 LLaMA 3.1 405B
- DeepSeek R1T Chimera
- Microsoft MAI DS R1
- Kimi Dev 72B
- And 9 more models

**Security**
- All API keys in environment variables
- Prompt injection detection
- Output sanitization
- Audit logging
- Zero Trust architecture

## Setup

### Environment Variables
Create a `.env` file with:

```bash
# AI Models (OpenRouter)
QWEN_CODER_32B_API_KEY=your_key
MISTRAL_SMALL_API_KEY=your_key

# ElevenLabs
ELEVENLABS_API_KEY=your_key

# Supabase
SUPABASE_PROJECT_URL=your_url
SUPABASE_ANON_PUBLIC=your_key

# Vercel
VERCEL_PROJECT_ID=your_id
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs on http://localhost:3000

### Production Build

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel --prod
```

Or use the GitHub integration for automatic deployments.

## File Structure

```
istani/
├── site/
│   ├── fitness.html           # Main fitness page
│   ├── css/
│   │   └── fitness.css        # iOS-styled design system
│   ├── js/
│   │   ├── fitness.js         # Main interactions
│   │   └── ai-integration.js  # AI API integration
│   └── images/
│       └── fitness/           # Fitness images
├── server.js                  # Express API server
├── package.json
├── vercel.json                # Vercel configuration
├── .env                       # Environment variables (not committed)
└── README-FITNESS.md
```

## API Endpoints

### Health Check
```
GET /api/health
```

Returns service status and availability.

### AI Chat
```
POST /api/ai-chat
Body: { message, context }
```

Send messages to AI fitness coach.

### User Progress
```
POST /api/users/progress
Body: { userId, workoutData }
```

Save workout progress to database.

```
GET /api/users/:userId/progress
```

Retrieve user workout history.

## Security Best Practices

1. Never commit `.env` files
2. All API keys stored in environment variables
3. Prompt injection detection on all inputs
4. Output sanitization prevents key leakage
5. CORS configured for production domain
6. Rate limiting on API endpoints
7. Input validation on all user data

## Research Citations

All training protocols based on peer-reviewed research:
- Schoenfeld et al. (2017) - Progressive overload
- Damas et al. (2016) - Stimulus-Recovery-Adaptation
- Fonseca et al. (2014) - Exercise variation
- Williams et al. (2017) - Periodization

## Support

For issues or questions:
- GitHub Issues: https://github.com/sano1233/istani/issues
- Email: support@istani.org

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome. Please read CONTRIBUTING.md first.

---

Built with science and powered by AI.
