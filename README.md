# ISTANI Fitness Platform

A comprehensive full-stack fitness tracking and e-commerce platform built with Next.js 15, Supabase, Stripe, and AI-powered features.

## Features

### Fitness Tracking
- **Workout Logging** - Track exercises, duration, calories burned
- **Nutrition Tracking** - Log meals, track macros (protein, carbs, fat), calorie counting
- **Water Intake** - Daily water consumption tracking with visual progress
- **Body Measurements** - Track weight, body fat percentage, and progress photos
- **Progress Analytics** - View historical data, charts, and achievement streaks

### AI-Powered Features
- **AI Meal Planning** - Generate personalized meal plans using OpenAI GPT-4
- **AI Workout Recommendations** - Get customized workout suggestions
- **Autonomous Coaching** - Automated coaching messages and motivation
- **Food Search** - USDA FoodData Central and Open Food Facts integration
- **Barcode Scanner** - Nutrition lookup by barcode (stub ready for implementation)

### E-Commerce
- **Product Catalog** - Browse fitness products and supplements
- **Shopping Cart** - Zustand-powered cart with persistent state
- **Stripe Checkout** - Secure payment processing
- **Order Management** - Track order history and status
- **Coaching Sessions** - Purchase one-on-one coaching

### User Management
- **Supabase Authentication** - Email/password and Google OAuth
- **User Profiles** - Customizable fitness goals and preferences
- **Secure Sessions** - JWT-based authentication with Row-Level Security

## Tech Stack

### Frontend
- **Next.js 15.1.2** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Zustand 5.0** - Lightweight state management
- **React Hook Form 7.53** - Form handling
- **Zod 3.23** - Schema validation

### Backend
- **Supabase** - PostgreSQL database, authentication, storage, real-time subscriptions
- **Stripe** - Payment processing and checkout
- **OpenAI GPT-4** - AI meal and workout recommendations
- **USDA FoodData Central** - Nutrition database
- **Open Food Facts** - Barcode scanning and food data

### DevOps
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD with 21+ automation workflows
- **ESLint & Prettier** - Code quality tools

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd istani
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
   STRIPE_SECRET_KEY=your-secret-key
   STRIPE_WEBHOOK_SECRET=your-webhook-secret

   # AI & APIs
   OPENAI_API_KEY=your-openai-api-key
   USDA_API_KEY=your-usda-api-key
   PEXELS_API_KEY=your-pexels-api-key

   # GitHub (for repo aggregator)
   GITHUB_TOKEN=your-github-token

   # App
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   CRON_SECRET=your-cron-secret
   ADMIN_REFRESH_TOKEN=your-admin-token
   ```

4. **Set up Supabase database**

   Run the SQL schema in your Supabase project:
   ```bash
   # In Supabase SQL Editor, run:
   # supabase/schema.sql
   ```

   Or use Supabase CLI:
   ```bash
   supabase db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses 30+ tables including:

- **Users & Profiles** - User accounts, fitness goals, preferences
- **Workouts** - Workout logs, programs, exercises
- **Nutrition** - Meals, nutrition goals, recommendations
- **Health** - Body measurements, water intake, body fat tracking
- **E-Commerce** - Products, categories, orders, cart items
- **Coaching** - Sessions, messages, leads

See `supabase/schema.sql` for complete schema definition.

## API Routes

### Authentication
- `POST /api/auth` - User authentication

### AI Features
- `POST /api/ai/meal` - Generate AI meal plans
- `POST /api/ai/workout` - Generate AI workout plans

### Food & Nutrition
- `GET /api/food/search` - Search USDA and Open Food Facts
- `GET /api/food/barcode` - Barcode lookup

### E-Commerce
- `POST /api/checkout` - Create Stripe checkout session
- `GET /api/products` - Fetch product catalog
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Images
- `GET /api/images/search` - Search Pexels/Unsplash
- `POST /api/images/refresh` - Refresh image cache

### Cron Jobs
- `POST /api/cron/daily-coaching` - Daily coaching messages

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run aggregate    # Run repository aggregator
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Import your repository** in Vercel
2. **Configure environment variables** (copy from `.env.example`)
3. **Deploy** - Vercel will auto-detect Next.js and build

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Required Environment Variables in Vercel

Set these in your Vercel project settings:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Stripe:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**AI & APIs:**
- `OPENAI_API_KEY`
- `USDA_API_KEY`
- `PEXELS_API_KEY`
- `UNSPLASH_ACCESS_KEY` (optional)

**GitHub:**
- `GITHUB_TOKEN`

**App:**
- `NEXT_PUBLIC_SITE_URL` (your production URL)
- `CRON_SECRET`
- `ADMIN_REFRESH_TOKEN`

### Post-Deployment Steps

1. **Configure Stripe Webhooks**
   - Add webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

2. **Configure Supabase Authentication**
   - Add production URL to allowed redirect URLs
   - Enable Google OAuth if needed

3. **Test Core Flows**
   - User registration and login
   - Workout and nutrition logging
   - Cart and checkout
   - AI features

## Build Status

```
✓ Build: PASSED
✓ TypeScript: 0 errors
✓ Routes: 32 (9 static, 17 dynamic, 15 API)
✓ Bundle Size: ~102 kB
✓ Middleware: 81.4 kB
```

## Project Structure

```
istani/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   ├── (shop)/              # E-commerce pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
├── lib/                     # Utilities and integrations
│   ├── supabase/           # Supabase clients
│   ├── autonomous/         # AI coaching engine
│   ├── store/              # Zustand stores
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
├── supabase/               # Database schema
├── .github/workflows/      # CI/CD workflows
└── public/                 # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## GitHub Actions

The project includes 21+ automated workflows:
- CI checks (linting, type checking, builds)
- Security scanning (CodeQL)
- Auto-fix and merge
- iOS CI/CD pipeline
- N8N integration workflows
- AI-powered PR analysis

## License

This project is private and proprietary.

## Support

For issues or questions, please open a GitHub issue or contact the development team.
