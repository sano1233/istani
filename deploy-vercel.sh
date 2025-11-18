#!/bin/bash

# Vercel Deployment Script for istani.org
# This script ensures a clean, error-free deployment to Vercel

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ISTANI.ORG - VERCEL DEPLOYMENT SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STEP 1: Pre-Deployment Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node version
echo "📦 Node Version: $(node --version)"
echo "📦 NPM Version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Type check
echo ""
echo "🔍 Running TypeScript checks..."
if npm run typecheck; then
    echo "✅ TypeScript checks passed"
else
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
fi

# Build test
echo ""
echo "🔨 Testing production build..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STEP 2: Verify Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for required files
FILES=("vercel.json" "next.config.js" "package.json" "middleware.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file not found"
        exit 1
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STEP 3: Environment Variables Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "⚠️  Make sure you have configured these environment variables in Vercel:"
echo ""
echo "  Required:"
echo "    - NEXT_PUBLIC_SUPABASE_URL"
echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "    - SUPABASE_SERVICE_ROLE_KEY"
echo "    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "    - STRIPE_SECRET_KEY"
echo "    - OPENAI_API_KEY"
echo "    - PEXELS_API_KEY"
echo "    - USDA_API_KEY"
echo ""
echo "  Optional but recommended:"
echo "    - DATABASE_URL"
echo "    - STRIPE_WEBHOOK_SECRET"
echo "    - CRON_SECRET"
echo "    - ADMIN_REFRESH_TOKEN"
echo "    - NEXT_PUBLIC_SITE_URL"
echo ""

read -p "Have you configured all required environment variables in Vercel? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please configure environment variables first:"
    echo "  1. Go to: https://vercel.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to Settings → Environment Variables"
    echo "  4. Add all required variables"
    echo ""
    echo "Or use the Vercel CLI:"
    echo "  vercel env add NEXT_PUBLIC_SUPABASE_URL production"
    echo ""
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  STEP 4: Deploy to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Choose deployment type:"
echo "  1) Production (vercel --prod)"
echo "  2) Preview (vercel)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    echo ""
    vercel --prod
elif [ "$choice" == "2" ]; then
    echo ""
    echo "🚀 Deploying to PREVIEW..."
    echo ""
    vercel
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT COMPLETE! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "  1. Configure Domain (if not done already):"
echo "     • Go to Vercel Dashboard → Settings → Domains"
echo "     • Add domain: istani.org"
echo "     • Follow DNS configuration instructions"
echo ""
echo "  2. Verify Deployment:"
echo "     • Visit your deployment URL"
echo "     • Test API: https://istani.org/api/health"
echo "     • Check SSL certificate"
echo ""
echo "  3. Monitor:"
echo "     • Vercel Dashboard: https://vercel.com/dashboard"
echo "     • View logs: vercel logs"
echo "     • Monitor performance in Analytics tab"
echo ""
echo "  4. Documentation:"
echo "     • Read VERCEL-SETUP-GUIDE.md for detailed instructions"
echo "     • Check DEPLOYMENT-CHECKLIST.md for full checklist"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
