# 🏋️ Istani Fitness - Complete Full-Stack E-Commerce Platform

![Istani Fitness](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet)

> **Transform Your Body, Transform Your Life** - The most comprehensive fitness platform with AI-powered coaching, personalized workouts, science-based nutrition tracking, and premium e-commerce.

**Live URL**: https://istani.org (https://istani-dpoolwes1-istanis-projects.vercel.app)

---

## 🎯 Features

### 💪 Fitness Tracking
- **Smart Workouts** - AI-generated workout plans with progressive overload tracking
- **Nutrition Tracking** - Science-based macro calculations (BMR, TDEE, protein/carbs/fats)
- **Progress Analytics** - Body composition analysis, strength progression, measurement tracking
- **Meal Logging** - Comprehensive meal tracking with real-time macro totals

### 🛒 E-Commerce
- **Product Catalog** - Premium supplements, equipment, and apparel
- **Shopping Cart** - Persistent cart with Zustand state management
- **Stripe Integration** - Secure payment processing with webhook handling
- **Order Management** - Complete order history and tracking

### 🎓 Elite Coaching
- **1-on-1 Coaching** - From $297 onboarding to $1,997/month elite plans
- **Session Scheduling** - Google Calendar integration (via ElevenLabs agent)
- **Progress Reviews** - Regular check-ins and form analysis
- **24/7 Support** - Direct coach access for elite members

### 🤖 AI Integration
- **ElevenLabs Voice Agent** - Voice-powered fitness coach with 8 AI models
- **Google Stitch AI** - Next-gen AI image generation for fitness content
- **Multi-Model Support** - MiniMax, Gemini, Claude, GPT-4, Llama, DeepSeek, Qwen, Cohere

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/sano1233/istani.git
cd istani

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up Supabase (see Database Setup below)

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see your application.

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Run Migration

```bash
# Navigate to Supabase SQL Editor
# Copy and paste the contents of: supabase/migrations/001_initial_schema.sql
# Run the migration
```

Or use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

### 3. Configure Authentication

1. Enable Email/Password auth in Supabase Dashboard
2. (Optional) Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google
   - Add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

### 4. Set Up Storage (Optional)

Create storage buckets for:
- `product-images` - Product photos
- `avatars` - User profile pictures

---

## 🔐 Environment Variables

Create `.env.local` file with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Getting Stripe Webhook Secret

1. Install Stripe CLI: `npm install -g stripe-cli`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret displayed

---

## 📦 Project Structure

```
istani/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/                   # E-commerce pages
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── coaching/
│   ├── (dashboard)/              # User dashboard
│   │   ├── dashboard/            # Main dashboard
│   │   ├── workouts/             # Workout tracking
│   │   ├── nutrition/            # Meal logging
│   │   ├── progress/             # Analytics
│   │   └── settings/             # User settings
│   ├── api/                      # API Routes
│   │   ├── checkout/             # Stripe checkout
│   │   └── webhooks/stripe/      # Stripe webhooks
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                    # Reusable components
│   ├── ui/                       # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── sidebar.tsx
│   └── product-card.tsx
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── store/                    # State management
│   │   └── cart-store.ts         # Zustand cart store
│   ├── fitness-calculations.ts   # BMR, TDEE, macros
│   ├── stripe.ts                 # Stripe config
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase types
│   └── index.ts                  # App types
├── supabase/                     # Database
│   └── migrations/
│       └── 001_initial_schema.sql
├── elevenlabs-agent/             # Voice agent backend
│   ├── server.js
│   ├── package.json
│   └── README.md
├── site/                         # Legacy static site
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - PostgreSQL database with auth & RLS
- **Stripe** - Payment processing
- **Next.js API Routes** - Serverless functions

### AI Services
- **ElevenLabs** - Voice AI agent
- **OpenRouter** - Multi-model AI access
- **Google Stitch** - AI image generation

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

### Environment Variables in Vercel

Add all variables from `.env.local` in:
**Project Settings → Environment Variables**

### Stripe Webhook in Production

1. Create webhook endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Point to: `https://istani.org/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret and add to Vercel environment variables

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Test Payment (Stripe Test Mode)

Use test card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 📊 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with fitness data |
| `products` | E-commerce product catalog |
| `orders` | Order history |
| `order_items` | Line items for orders |
| `workouts` | Workout sessions |
| `workout_exercises` | Individual exercises |
| `meals` | Nutrition logging |
| `body_measurements` | Progress tracking |
| `coaching_sessions` | Coaching appointments |
| `donations` | Buy Me a Coffee donations |

All tables have Row Level Security (RLS) enabled.

---

## 🔒 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Stripe webhook signature verification
- ✅ Environment variable validation
- ✅ XSS protection headers
- ✅ CSRF protection
- ✅ Secure authentication with Supabase Auth

---

## 🎯 Fitness Calculations

All formulas are science-based and validated:

- **BMR** - Mifflin-St Jeor Equation (most accurate for modern populations)
- **TDEE** - Activity level multipliers
- **Macros** - Evidence-based protein recommendations (1.6-2.4g/kg)
- **Calories** - Deficit/surplus based on goal
- **Body Fat** - Navy Method estimation

---

## 📞 Support

**Email**: istaniDOTstore@proton.me
**Platform**: https://istani.org
**Donations**: https://buymeacoffee.com/istanifitn

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Science-based fitness formulas from peer-reviewed research
- Inspired by Apple Fitness+, Peloton, and Tonal design systems
- Built with ❤️ by the Istani Fitness Team

---

## 🚧 Roadmap

- [ ] Mobile app (React Native)
- [ ] Social features (follow friends, share workouts)
- [ ] Video form checks with AI analysis
- [ ] Marketplace for certified coaches
- [ ] Meal plan generator with AI
- [ ] Integration with fitness trackers (Fitbit, Apple Watch)

---

**Last Updated**: 2025-11-11
**Version**: 2.0.0
**Author**: Istani Fitness Team
