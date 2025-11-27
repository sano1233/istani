#!/bin/bash

# ISTANI Full Stack Production Deployment Script
# Budget: $147/month across multiple services

set -e  # Exit on error

echo "🚀 ISTANI Production Deployment Starting..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required CLI tools are installed
check_requirements() {
    print_status "Checking required CLI tools..."

    local missing_tools=()

    command -v node >/dev/null 2>&1 || missing_tools+=("node")
    command -v npm >/dev/null 2>&1 || missing_tools+=("npm")
    command -v git >/dev/null 2>&1 || missing_tools+=("git")

    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        echo "Please install missing tools and try again."
        exit 1
    fi

    print_success "All required tools are installed"
}

# Install Vercel CLI
install_vercel_cli() {
    if ! command -v vercel >/dev/null 2>&1; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_success "Vercel CLI already installed"
    fi
}

# Install Railway CLI
install_railway_cli() {
    if ! command -v railway >/dev/null 2>&1; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
        print_success "Railway CLI installed"
    else
        print_success "Railway CLI already installed"
    fi
}

# Install Sentry CLI
install_sentry_cli() {
    if ! command -v sentry-cli >/dev/null 2>&1; then
        print_status "Installing Sentry CLI..."
        npm install -g @sentry/cli
        print_success "Sentry CLI installed"
    else
        print_success "Sentry CLI already installed"
    fi
}

# Build the Next.js application
build_nextjs() {
    print_status "Building Next.js application..."
    npm ci
    npm run typecheck
    npm run build
    print_success "Next.js build completed"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."

    if [ -z "$VERCEL_TOKEN" ]; then
        print_warning "VERCEL_TOKEN not set. Please login manually."
        vercel login
    fi

    # Deploy to production
    vercel --prod --yes

    print_success "Deployed to Vercel"
}

# Set up Vercel environment variables
setup_vercel_env() {
    print_status "Setting up Vercel environment variables..."

    if [ ! -f .env.production ]; then
        print_error ".env.production file not found"
        print_warning "Please create .env.production from .env.example"
        return 1
    fi

    print_warning "Environment variables should be set via Vercel dashboard"
    print_warning "Visit: https://vercel.com/[your-org]/istani/settings/environment-variables"

    print_success "Environment variable setup instructions displayed"
}

# Deploy AI Agent to Railway
deploy_railway() {
    print_status "Deploying AI Agent to Railway..."

    if [ -z "$RAILWAY_TOKEN" ]; then
        print_warning "RAILWAY_TOKEN not set. Please login manually."
        railway login
    fi

    cd ai-agent

    # Initialize Railway project if not exists
    if [ ! -f railway.json ]; then
        print_status "Initializing Railway project..."
        railway init
    fi

    # Deploy
    railway up

    cd ..

    print_success "AI Agent deployed to Railway"
}

# Set up database optimizations
optimize_database() {
    print_status "Database optimization instructions..."

    print_warning "Run the following SQL in your Supabase SQL Editor:"
    echo ""
    echo "-- Create performance indexes"
    echo "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"
    echo "CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);"
    echo "CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_logs(user_id, log_date);"
    echo "CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);"
    echo ""
    echo "-- Enable query statistics"
    echo "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
    echo ""

    print_success "Database optimization SQL displayed"
}

# Configure Stripe webhooks
setup_stripe_webhooks() {
    print_status "Stripe webhook configuration..."

    local webhook_url="https://istani.org/api/stripe/webhook"

    print_warning "Configure Stripe webhook:"
    echo "1. Go to: https://dashboard.stripe.com/webhooks"
    echo "2. Click 'Add endpoint'"
    echo "3. Set endpoint URL: $webhook_url"
    echo "4. Select events:"
    echo "   - checkout.session.completed"
    echo "   - payment_intent.succeeded"
    echo "   - customer.subscription.created"
    echo "   - customer.subscription.updated"
    echo "   - customer.subscription.deleted"
    echo "5. Copy the webhook signing secret"
    echo "6. Add to Vercel env as STRIPE_WEBHOOK_SECRET"
    echo ""

    print_success "Stripe webhook setup instructions displayed"
}

# Set up Sentry error monitoring
setup_sentry() {
    print_status "Setting up Sentry..."

    if [ ! -f sentry.properties ]; then
        print_warning "Sentry not initialized. Run: npx @sentry/wizard@latest -i nextjs"
    fi

    print_success "Sentry setup instructions displayed"
}

# Set up monitoring
setup_monitoring() {
    print_status "Monitoring setup instructions..."

    echo ""
    echo "📊 Set up the following monitoring services:"
    echo ""
    echo "1. UptimeRobot (Free):"
    echo "   - Monitor: https://istani.org"
    echo "   - Monitor: https://istani.org/api/health"
    echo "   - Check interval: 5 minutes"
    echo ""
    echo "2. Better Stack (Free):"
    echo "   - Create source for Next.js logs"
    echo "   - Add BETTERSTACK_TOKEN to Vercel env"
    echo ""
    echo "3. Vercel Analytics:"
    echo "   - Enable in Vercel dashboard"
    echo "   - Enable Web Vitals tracking"
    echo ""

    print_success "Monitoring setup instructions displayed"
}

# Verify Cloudflare configuration
verify_cloudflare() {
    print_status "Verifying Cloudflare configuration..."

    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        print_warning "CLOUDFLARE_API_TOKEN not set. Skipping verification."
        return 0
    fi

    # Test token
    local response=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID:-8a96ac34caf00be04c7fa407efcefa85}/tokens/verify" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")

    if echo "$response" | grep -q '"success":true'; then
        print_success "Cloudflare API token is valid"
    else
        print_warning "Cloudflare API token verification failed"
        echo "Response: $response"
    fi

    if [ -z "$CLOUDFLARE_ZONE_ID" ] || [ "$CLOUDFLARE_ZONE_ID" = "your_zone_id_here" ]; then
        print_warning "CLOUDFLARE_ZONE_ID not configured"
        echo "Get Zone ID from: https://dash.cloudflare.com -> Select domain -> Overview"
    else
        print_success "Cloudflare Zone ID is configured"
    fi

    print_success "Cloudflare verification completed"
}

# Run deployment health checks
health_checks() {
    print_status "Running health checks..."

    local app_url="https://istani.org"

    # Wait for deployment to be ready
    sleep 10

    # Check main app
    if curl -f -s "$app_url" > /dev/null; then
        print_success "Main app is responding"
    else
        print_error "Main app is not responding"
        return 1
    fi

    # Check API health endpoint
    if curl -f -s "$app_url/api/health" > /dev/null; then
        print_success "API health check passed"
    else
        print_warning "API health check failed"
    fi

    print_success "Health checks completed"
}

# Display cost summary
cost_summary() {
    echo ""
    echo "================================================"
    echo "💰 Monthly Cost Summary ($147 Budget)"
    echo "================================================"
    echo ""
    echo "Service              Tier        Cost/Month"
    echo "------------------------------------------------"
    echo "Vercel               Pro         $20"
    echo "Supabase             Pro         $25"
    echo "Railway              Standard    $30"
    echo "OpenAI               Usage       $30"
    echo "Cloudflare           Free        $0"
    echo "Sentry               Developer   $26"
    echo "UptimeRobot          Free        $0"
    echo "Better Stack         Free        $0"
    echo "Reserve              Buffer      $16"
    echo "------------------------------------------------"
    echo "TOTAL                            $147"
    echo "================================================"
    echo ""
}

# Display post-deployment checklist
post_deployment_checklist() {
    echo ""
    echo "================================================"
    echo "✅ Post-Deployment Checklist"
    echo "================================================"
    echo ""
    echo "[ ] Verify Vercel deployment successful"
    echo "[ ] Set all environment variables in Vercel"
    echo "[ ] Deploy AI agent to Railway"
    echo "[ ] Configure Cloudflare DNS"
    echo "[ ] Set CLOUDFLARE_ZONE_ID in Vercel environment variables"
    echo "[ ] Set CLOUDFLARE_PURGE_SECRET in Vercel environment variables"
    echo "[ ] Test Cloudflare cache purge: POST /api/cloudflare/purge"
    echo "[ ] Set up Stripe webhooks"
    echo "[ ] Enable Sentry error tracking"
    echo "[ ] Configure UptimeRobot monitoring"
    echo "[ ] Set up Better Stack logging"
    echo "[ ] Run database optimization SQL"
    echo "[ ] Test user registration/login"
    echo "[ ] Test workout and nutrition logging"
    echo "[ ] Test AI meal planning"
    echo "[ ] Test Stripe checkout"
    echo "[ ] Verify webhook handlers"
    echo "[ ] Check all integrations"
    echo "[ ] Monitor for 24 hours"
    echo ""
    echo "================================================"
    echo ""
}

# Main deployment flow
main() {
    echo ""
    echo "🎯 ISTANI Full Stack Deployment"
    echo "Budget: $147/month"
    echo "Target: istani.org"
    echo ""

    check_requirements
    install_vercel_cli
    install_railway_cli
    install_sentry_cli

    build_nextjs

    deploy_vercel
    setup_vercel_env

    # Uncomment when ready to deploy AI agent
    # deploy_railway

    optimize_database
    setup_stripe_webhooks
    setup_sentry
    setup_monitoring
    verify_cloudflare

    health_checks

    cost_summary
    post_deployment_checklist

    echo ""
    print_success "🎉 Deployment script completed!"
    echo ""
    print_warning "Next steps:"
    echo "1. Complete the post-deployment checklist above"
    echo "2. Monitor the application for 24-48 hours"
    echo "3. Review costs daily for the first week"
    echo "4. Optimize based on real usage patterns"
    echo ""
    print_success "Happy deploying! 🚀"
    echo ""
}

# Run main function
main "$@"
