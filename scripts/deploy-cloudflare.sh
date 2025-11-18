#!/bin/bash

# Cloudflare Deployment Script for ISTANI
# This script automates the deployment process to Cloudflare

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-8a96ac34caf00be04c7fa407efcefa85}"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-VTpUgPTAV18upz5VecWeqYEnObZOOPi9fd5ELFl-}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   ISTANI Cloudflare Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Step 1: Verify Cloudflare token
echo -e "${YELLOW}[1/6] Verifying Cloudflare API token...${NC}"
VERIFY_RESPONSE=$(curl -s "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens/verify" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

if echo "$VERIFY_RESPONSE" | grep -q '"status":"active"'; then
    echo -e "${GREEN}✓ Token is valid and active${NC}"
else
    echo -e "${RED}✗ Token verification failed${NC}"
    echo "$VERIFY_RESPONSE"
    exit 1
fi

# Step 2: Check Node.js and npm
echo ""
echo -e "${YELLOW}[2/6] Checking Node.js environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Run type check
echo ""
echo -e "${YELLOW}[4/6] Running type checks...${NC}"
npm run typecheck
echo -e "${GREEN}✓ Type checks passed${NC}"

# Step 5: Build the project
echo ""
echo -e "${YELLOW}[5/6] Building production bundle...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed successfully${NC}"

# Step 6: Deploy options
echo ""
echo -e "${YELLOW}[6/6] Deployment options:${NC}"
echo ""
echo "Select deployment target:"
echo "  1) Vercel (with Cloudflare CDN)"
echo "  2) Cloudflare Pages"
echo "  3) Skip deployment (build only)"
echo ""
read -p "Enter choice [1-3]: " deploy_choice

case $deploy_choice in
    1)
        echo ""
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        if command -v vercel &> /dev/null; then
            vercel --prod
            echo -e "${GREEN}✓ Deployed to Vercel${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "  1. Configure DNS in Cloudflare dashboard"
            echo "  2. Point domain to Vercel"
            echo "  3. Enable Cloudflare proxy (orange cloud)"
            echo "  4. Follow cloudflare-setup.md for full configuration"
        else
            echo -e "${RED}✗ Vercel CLI not installed${NC}"
            echo "Install with: npm i -g vercel"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}Deploying to Cloudflare Pages...${NC}"
        if command -v wrangler &> /dev/null; then
            # Note: This is a simplified example. Actual Cloudflare Pages deployment
            # for Next.js requires additional configuration
            echo -e "${YELLOW}⚠ Cloudflare Pages deployment for Next.js requires manual setup${NC}"
            echo ""
            echo "Follow these steps:"
            echo "  1. Go to https://dash.cloudflare.com"
            echo "  2. Navigate to Pages"
            echo "  3. Create a new project"
            echo "  4. Connect your GitHub repository"
            echo "  5. Configure build settings:"
            echo "     - Framework preset: Next.js"
            echo "     - Build command: npm run build"
            echo "     - Build output directory: .next"
            echo "  6. Deploy"
        else
            echo -e "${RED}✗ Wrangler CLI not installed${NC}"
            echo "Install with: npm i -g wrangler"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo -e "${GREEN}✓ Build completed. Skipping deployment.${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Summary
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   Deployment process completed!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}Build artifacts:${NC}"
echo "  - Output directory: .next/"
echo "  - Build successful: ✓"
echo "  - Type checks: ✓"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  - Test locally: npm run dev"
echo "  - Run build: npm run build"
echo "  - Test production: npm run start"
echo "  - Deploy to Vercel: vercel --prod"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  - Cloudflare config: .cloudflare-config.md"
echo "  - Setup guide: cloudflare-setup.md"
echo "  - Deployment plan: FULL-STACK-DEPLOYMENT-PLAN.md"
echo ""
echo -e "${GREEN}Ready for production! 🚀${NC}"
