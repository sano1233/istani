# FitAI - AI-Driven Fitness SaaS Platform

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)

An intelligent fitness platform powered by AI that provides personalized workout plans, nutrition guidance, and real-time progress tracking.

## Features

- **AI-Powered Workout Generation**: Get custom workout plans tailored to your fitness goals and experience level
- **Smart Nutrition Planning**: Personalized meal plans based on your dietary preferences and goals
- **Progress Tracking**: Comprehensive analytics to monitor your fitness journey
- **Subscription Management**: Integrated Stripe payments for premium features
- **Real-time Updates**: Live progress tracking and instant AI recommendations
- **Workflow Automation**: n8n integration for automated user onboarding and notifications

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend

- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL** - Relational database
- **Stripe** - Payment processing
- **PayPal** - Alternative payment option

### AI & ML

- **OpenAI GPT** - Workout and nutrition plan generation
- **Vercel AI SDK** - AI integration framework
- **Ollama** - Local AI model hosting
- **Qdrant** - Vector database for RAG

### DevOps & Automation

- **Docker** - Containerization
- **n8n** - Workflow automation
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for local development)
- Supabase account
- Stripe account (for payments)
- OpenAI API key (or local Ollama setup)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/sano1233/istani.git
cd istani
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Update the following variables:
- Supabase credentials (already configured)
- Stripe API keys
- OpenAI API key
- Other service credentials

4. **Set up Supabase database**

Run the migration to create the database schema:

```bash
# If using Supabase CLI
npx supabase db push

# Or manually run the SQL in supabase/migrations/20241114_initial_schema.sql
# in your Supabase SQL Editor
```

5. **Run the development server**

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Docker Setup

For a complete local development environment with all services:

```bash
# Build and start all services
npm run docker:up

# Stop all services
npm run docker:down
```

This will start:
- Next.js app (port 3000)
- n8n workflow automation (port 5678)
- Ollama AI models (port 11434)
- Qdrant vector database (port 6333)
- Redis cache (port 6379)

## Project Structure

```
fitness-saas/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── workouts/      # Workout management
│   │   ├── stripe/        # Payment processing
│   │   └── webhooks/      # Webhook handlers
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── workouts/         # Workout-related components
│   ├── providers/        # Context providers
│   └── auth/             # Auth components
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe utilities
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── supabase/
│   └── migrations/       # Database migrations
├── n8n/
│   └── workflows/        # n8n workflow templates
├── public/               # Static assets
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Next.js container
└── README.md
```

## API Routes

### Workouts

- `POST /api/workouts/generate` - Generate AI workout plan
- `GET /api/workouts` - Get user's workout plans
- `POST /api/workouts/session` - Log workout session

### Stripe

- `POST /api/stripe/subscribe` - Create checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Auth

- Handled by Supabase Auth

## Database Schema

### Tables

- **profiles** - User profile information
- **subscriptions** - Stripe subscription data
- **workout_plans** - AI-generated workout plans
- **workout_sessions** - Completed workout logs
- **nutrition_plans** - Personalized nutrition plans

See `supabase/migrations/20241114_initial_schema.sql` for complete schema.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables from `.env.example` are set in your deployment platform.

## n8n Workflows

The platform includes automated workflows for:

1. **User Onboarding** - Automatically generate welcome workout and send email
2. **Progress Notifications** - Weekly progress reports
3. **Subscription Management** - Handle payment events

Import workflows from `n8n/workflows/` directory into your n8n instance.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

- Open an issue on GitHub
- Email: support@fitai.com

## Acknowledgments

- OpenAI for AI capabilities
- Supabase for backend infrastructure
- Vercel for hosting
- The open-source community

---

Built with ❤️ by the FitAI team
