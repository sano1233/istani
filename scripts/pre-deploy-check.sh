#!/bin/bash

# ISTANI Deployment Pre-Check Script
# Ensures all deployment requirements are met before deployment

set -e

echo "🔍 ISTANI Deployment Pre-Check"
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check and report
check() {
    local name="$1"
    local command="$2"

    echo -n "Checking $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Function to check with output
check_with_output() {
    local name="$1"
    local command="$2"

    echo "Checking $name..."

    if eval "$command"; then
        echo -e "${GREEN}✓ $name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $name failed${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

echo ""
echo "1. Dependency Check"
echo "-------------------"
check "Node modules installed" "[ -d node_modules ]"
check "Package lock exists" "[ -f package-lock.json ]"

echo ""
echo "2. Environment Validation"
echo "------------------------"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
else
    echo -e "${YELLOW}⚠ .env.local not found (optional)${NC}"
fi

if [ -f "scripts/validate-env.js" ]; then
    check_with_output "Environment variables" "node scripts/validate-env.js"
fi

echo ""
echo "3. Code Quality"
echo "---------------"
check_with_output "TypeScript compilation" "npx tsc --noEmit"
check_with_output "Linting" "npm run lint"

echo ""
echo "4. Build Test"
echo "-------------"
echo "Building application..."
if NODE_ENV=production npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

echo ""
echo "5. Security Check"
echo "-----------------"
if npm audit --production --audit-level=high > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No high-severity vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠ Security vulnerabilities detected (check npm audit)${NC}"
fi

echo ""
echo "6. Configuration Files"
echo "---------------------"
check "vercel.json exists" "[ -f vercel.json ]"
check ".vercel/project.json exists" "[ -f .vercel/project.json ]"
check "next.config.mjs exists" "[ -f next.config.mjs ]"

echo ""
echo "7. Git Status"
echo "-------------"
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
else
    echo -e "${YELLOW}⚠ Uncommitted changes detected${NC}"
fi

echo ""
echo "================================"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILURES check(s) failed. Please fix before deploying.${NC}"
    exit 1
fi
