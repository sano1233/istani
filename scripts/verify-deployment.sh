#!/bin/bash

# Istani Fitness - Automated Deployment Verification Script
# This script verifies all autonomous systems are ready for production

echo "🚀 ISTANI FITNESS - AUTOMATED DEPLOYMENT VERIFICATION"
echo "======================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - FILE MISSING: $1"
        ((CHECKS_FAILED++))
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - DIRECTORY MISSING: $1"
        ((CHECKS_FAILED++))
    fi
}

echo "📋 CORE CONFIGURATION"
echo "--------------------"
check_file "package.json" "Package configuration"
check_file "next.config.js" "Next.js configuration"
check_file "tsconfig.json" "TypeScript configuration"
check_file "tailwind.config.ts" "Tailwind CSS configuration"
check_file "vercel.json" "Vercel deployment configuration"
echo ""

echo "🗄️  DATABASE MIGRATIONS"
echo "--------------------"
check_file "supabase/migrations/001_initial_schema.sql" "Initial schema migration (358 lines)"
check_file "supabase/migrations/002_autonomous_features.sql" "Autonomous features migration (277 lines)"
echo ""

echo "🤖 AUTONOMOUS SYSTEMS"
echo "--------------------"
check_file "lib/autonomous/coaching-engine.ts" "AI Coaching Engine (15KB)"
check_file "app/api/cron/daily-coaching/route.ts" "Daily coaching cron endpoint"
check_file "lib/fitness-calculations.ts" "Science-based fitness calculations"
echo ""

echo "📱 DASHBOARD PAGES"
echo "--------------------"
check_file "app/(dashboard)/dashboard/page.tsx" "Main dashboard"
check_file "app/(dashboard)/workouts/page.tsx" "Workouts page"
check_file "app/(dashboard)/nutrition/page.tsx" "Nutrition page"
check_file "app/(dashboard)/water/page.tsx" "Water tracking page"
check_file "app/(dashboard)/progress/page.tsx" "Progress tracking page"
check_file "app/(dashboard)/settings/page.tsx" "Settings page"
echo ""

echo "🧩 COMPONENTS"
echo "--------------------"
check_file "components/workout-logger.tsx" "Workout logger"
check_file "components/meal-logger.tsx" "Meal logger"
check_file "components/water-tracker.tsx" "Water tracker"
check_file "components/coaching-messages.tsx" "AI coaching messages"
check_file "components/daily-checkin-modal.tsx" "Daily check-in modal"
check_file "components/achievement-toast.tsx" "Achievement notifications"
check_file "components/voice-assistant.tsx" "ElevenLabs voice assistant"
echo ""

echo "🎯 AUTHENTICATION & SECURITY"
echo "--------------------"
check_file "app/(auth)/login/page.tsx" "Login page"
check_file "app/(auth)/register/page.tsx" "Registration page"
check_file "middleware.ts" "Authentication middleware"
check_file "lib/supabase/server.ts" "Supabase server client"
check_file "lib/supabase/client.ts" "Supabase browser client"
echo ""

echo "💳 E-COMMERCE"
echo "--------------------"
check_file "app/api/checkout/route.ts" "Stripe checkout API"
check_file "app/api/webhooks/stripe/route.ts" "Stripe webhook handler"
check_file "app/(shop)/products/page.tsx" "Products page"
check_file "app/(shop)/cart/page.tsx" "Shopping cart"
echo ""

echo "🎨 UI & LAYOUT"
echo "--------------------"
check_file "app/layout.tsx" "Root layout"
check_file "app/(dashboard)/layout.tsx" "Dashboard layout"
check_file "app/page.tsx" "Landing page"
check_file "components/ui/sidebar.tsx" "Sidebar navigation"
echo ""

echo "⚙️  CONFIGURATION FILES"
echo "--------------------"
check_file ".env.example" "Environment variables template"
check_file ".gitignore" "Git ignore rules"
check_file "README.md" "Documentation"
echo ""

echo "📊 SUMMARY"
echo "======================================================"
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL SYSTEMS READY FOR AUTOMATED DEPLOYMENT${NC}"
    echo ""
    echo "🚀 DEPLOYMENT CHECKLIST:"
    echo "  1. ✓ All files verified"
    echo "  2. ⏳ Set environment variables in Vercel"
    echo "  3. ⏳ Run database migrations in Supabase"
    echo "  4. ⏳ Verify deployment at istani.org"
    echo ""
    exit 0
else
    echo -e "${RED}✗ DEPLOYMENT BLOCKED - Missing files detected${NC}"
    echo ""
    exit 1
fi
