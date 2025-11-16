# Istani Fitness - E-Commerce & Fitness Tracking Platform

A complete full-stack fitness e-commerce application built with Next.js 15, Supabase, and Stripe.

## Features

### E-Commerce
- 🛍️ Product catalog with categories
- 🛒 Shopping cart with persistent state
- 💳 Stripe payment integration
- 📦 Order management
- 🔍 Product search and filtering

### Fitness Tracking
- 📊 Dashboard with fitness metrics
- 💪 Workout tracking
- 📈 Progress monitoring
- 🎯 Goal setting and tracking
- 🧮 BMI, BMR, and TDEE calculators

### User Management
- 🔐 Supabase authentication (email/password + OAuth)
- 👤 User profiles with fitness data
- ⚙️ Settings and preferences
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **State Management:** Zustand
- **Icons:** Material Symbols

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Stripe account
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sano1233/istani.git
cd istani
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Set up Supabase database:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application includes a comprehensive database schema with:

- **profiles**: User profiles with fitness data
- **products**: Product catalog
- **categories**: Product categories
- **orders**: Order management
- **cart_items**: Shopping cart
- **workout_programs**: Workout programs
- **user_progress**: Progress tracking

Run the migration file in your Supabase SQL editor to set up all tables, policies, and seed data.

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import the project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. Configure environment variables in Vercel:
   - Add all variables from `.env.local.example`
   - Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain

4. Deploy!

### Supabase Configuration

1. **Enable Authentication Providers:**
   - Go to Authentication → Providers
   - Enable Email/Password
   - Configure Google OAuth (optional)

2. **Set up Storage:**
   - Create a bucket for product images
   - Configure public access policies

3. **Configure Redirect URLs:**
   - Add your Vercel domain to allowed redirect URLs
   - Format: `https://your-domain.vercel.app/**`

### Stripe Configuration

1. **Get API Keys:**
   - Dashboard → Developers → API Keys
   - Copy publishable and secret keys

2. **Set up Webhooks:**
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret to environment variables

## Project Structure

```
istani-fitness/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── (shop)/          # Shop pages
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/
│   ├── ui/              # UI components
│   └── product-card.tsx # Product card component
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── store/           # Zustand stores
│   ├── stripe.ts        # Stripe utilities
│   ├── utils.ts         # General utilities
│   └── fitness-calculations.ts
├── types/               # TypeScript types
├── supabase/
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## Key Features Implementation

### Authentication Flow
- Users can sign up with email/password or Google OAuth
- Protected routes redirect to login
- Middleware handles session refresh

### Shopping Cart
- Persistent cart using Zustand with localStorage
- Real-time cart updates
- Quantity management

### Fitness Calculations
- BMI (Body Mass Index)
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- Macro calculations based on goals

### Payment Processing
- Stripe Checkout integration
- Webhook handling for order updates
- Secure payment processing

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes |

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Adding Products

1. Go to your Supabase dashboard
2. Navigate to Table Editor → products
3. Insert new products with the following fields:
   - name, slug, description, short_description
   - price, compare_at_price (optional)
   - images (array of URLs)
   - category_id
   - inventory_quantity
   - is_active, is_featured

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
colors: {
  primary: '#0df259',           // Primary brand color
  'background-dark': '#102216', // Dark background
}
```

### Fonts
The app uses Space Grotesk. Change in `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google'
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@istani.org or open an issue on GitHub.

## Roadmap

- [ ] Admin dashboard for product management
- [ ] Advanced workout program builder
- [ ] Nutrition tracking integration
- [ ] Social features and community
- [ ] Mobile app (React Native)
- [ ] Email automation
- [ ] Analytics dashboard
- [ ] Multi-currency support
- [ ] Subscription management

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com)
- Payments by [Stripe](https://stripe.com)
- Icons from [Material Symbols](https://fonts.google.com/icons)

---

**Built with ❤️ for the fitness community**
