# Vercel Deployment Guide

## Required Environment Variables

Set these in your Vercel project settings at: `https://vercel.com/[your-username]/istani/settings/environment-variables`

### Critical (Required for middleware to work)

```bash
# Supabase - Required for authentication middleware
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Database

```bash
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### Payments

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### APIs (Optional)

```bash
# Image APIs
PEXELS_API_KEY=your-pexels-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key

# AI APIs
OPENAI_API_KEY=sk-xxx

# Food/Nutrition APIs
USDA_API_KEY=your-usda-api-key

# GitHub
GITHUB_TOKEN=ghp_xxx

# Security
ADMIN_REFRESH_TOKEN=your-secure-token
CRON_SECRET=your-cron-secret
```

## Deployment Configuration

### Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Root Directory

- Keep as root `/` (do not change)

### Node.js Version

- Use Node.js 18.x or higher
- Set in `.node-version` file (already configured)

## Middleware Configuration

The middleware handles Supabase session management. It runs on every request except:

- Static files (`_next/static`)
- Image optimization files (`_next/image`)
- Favicon and images (`.svg`, `.png`, `.jpg`, etc.)

**Important**: The middleware requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be set in Vercel environment variables.

## Build Optimizations

### Current Settings

1. **ESLint**: Ignored during builds (`ignoreDuringBuilds: true`)
2. **TypeScript**: Strict type checking enabled (`ignoreBuildErrors: false`)
3. **Webpack**: Configured for Supabase compatibility

### Known Build Warnings

You may see warnings about Node.js APIs in Edge Runtime for Supabase. These are expected and handled by our configuration.

## Troubleshooting

### 403 Forbidden Error

**Cause**: Missing Supabase environment variables

**Solution**:
1. Go to Vercel project settings
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy the application

### Build Failures

**Check**:
1. All required environment variables are set
2. Node.js version is 18.x or higher
3. Build command is `npm run build`
4. Dependencies are properly installed

### Middleware Errors

If middleware is causing issues:
1. Verify Supabase credentials are correct
2. Check that middleware matcher pattern is not too restrictive
3. Ensure Supabase project is active and accessible

## Testing Deployment Locally

Test the production build locally before deploying:

```bash
# Build the project
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to test.

## Vercel CLI Deployment

You can also deploy using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Deployment succeeds without errors
- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] API routes respond correctly
- [ ] Images load from Supabase
- [ ] Stripe integration works (if applicable)

## Links

- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Environment Variables**: `https://vercel.com/[username]/istani/settings/environment-variables`
- **Deployment Logs**: `https://vercel.com/[username]/istani/deployments`
- **Domains**: `https://vercel.com/[username]/istani/settings/domains`
