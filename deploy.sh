#!/bin/bash

# ISTANI Automated Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on error

echo "🚀 ISTANI Automated Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Are you in the project root?"
    exit 1
fi

print_info "Step 1: Installing dependencies..."
npm install
print_success "Dependencies installed"

print_info "Step 2: Running database migration on Supabase..."
print_warning "You need to run this migration manually on your Supabase dashboard:"
print_warning "1. Go to https://app.supabase.com/project/_/editor"
print_warning "2. Open SQL Editor"
print_warning "3. Copy and paste the contents of: supabase/migrations/003_enhanced_nutrition.sql"
print_warning "4. Execute the SQL"
echo ""
read -p "Press ENTER after you've completed the database migration..."
print_success "Database migration acknowledged"

print_info "Step 3: Setting up environment variables..."
print_warning "Make sure these environment variables are set in your deployment platform:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - NEXT_PUBLIC_USDA_API_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - NEXT_PUBLIC_SITE_URL"
echo ""
read -p "Press ENTER after you've set up environment variables..."
print_success "Environment variables acknowledged"

print_info "Step 4: Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build successful!"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

print_info "Step 5: Deploying to production..."
print_warning "Auto-deployment depends on your platform:"
echo ""
echo "For Vercel:"
echo "  - Push to main branch will auto-deploy"
echo "  - Or run: vercel --prod"
echo ""
echo "For Netlify:"
echo "  - Push to main branch will auto-deploy"
echo "  - Or run: netlify deploy --prod"
echo ""
echo "For Cloudflare Pages:"
echo "  - Push to main branch will auto-deploy"
echo "  - Or use Cloudflare dashboard"
echo ""

read -p "Which platform are you deploying to? (vercel/netlify/cloudflare/manual): " platform

case $platform in
    vercel)
        print_info "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_success "Deployed to Vercel!"
        else
            print_warning "Vercel CLI not found. Install with: npm i -g vercel"
            print_warning "Or push to main branch for auto-deployment"
        fi
        ;;
    netlify)
        print_info "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
            print_success "Deployed to Netlify!"
        else
            print_warning "Netlify CLI not found. Install with: npm i -g netlify-cli"
            print_warning "Or push to main branch for auto-deployment"
        fi
        ;;
    cloudflare)
        print_info "Deploying to Cloudflare Pages..."
        print_warning "Use Cloudflare dashboard or push to main branch"
        print_warning "Visit: https://dash.cloudflare.com/"
        ;;
    manual)
        print_info "Manual deployment selected"
        print_warning "Build output is in .next/ directory"
        print_warning "Run 'npm start' to test locally"
        ;;
    *)
        print_warning "Unknown platform. Skipping deployment."
        ;;
esac

echo ""
print_success "============================================"
print_success "  ISTANI Deployment Process Complete!"
print_success "============================================"
echo ""
print_info "Next steps:"
echo "  1. Visit your production URL"
echo "  2. Test all features:"
echo "     - Food search (USDA + barcode scanner)"
echo "     - Meal logging"
echo "     - Recipe builder"
echo "     - Charts (weight trends, macro distribution)"
echo "     - Micronutrient panel"
echo "  3. Monitor for errors in your platform dashboard"
echo ""
print_success "Happy deploying! 🎉"
