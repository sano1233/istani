#!/bin/bash

# Cloudflare Setup Helper Script
# Helps configure Cloudflare integration for ISTANI

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_error "CLOUDFLARE_API_TOKEN environment variable not set"
    echo ""
    echo "Set it with: export CLOUDFLARE_API_TOKEN=your-token-here"
    echo "Or add it to your .env file"
    exit 1
fi

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-8a96ac34caf00be04c7fa407efcefa85}"

print_status "Verifying Cloudflare API token..."

# Verify token
VERIFY_RESPONSE=$(curl -s -X GET \
    "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/tokens/verify" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
    print_success "API token is valid and active"
    TOKEN_ID=$(echo "$VERIFY_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    TOKEN_STATUS=$(echo "$VERIFY_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "  Token ID: $TOKEN_ID"
    echo "  Status: $TOKEN_STATUS"
else
    print_error "Token verification failed"
    echo "Response: $VERIFY_RESPONSE"
    exit 1
fi

echo ""
print_status "Fetching zones..."

# Get zones
ZONES_RESPONSE=$(curl -s -X GET \
    "https://api.cloudflare.com/client/v4/zones" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json")

if echo "$ZONES_RESPONSE" | grep -q '"success":true'; then
    print_success "Zones retrieved successfully"
    echo ""
    echo "Available zones:"
    echo "$ZONES_RESPONSE" | grep -o '"id":"[^"]*"' | while read -r line; do
        ZONE_ID=$(echo "$line" | cut -d'"' -f4)
        ZONE_NAME=$(echo "$ZONES_RESPONSE" | grep -A 5 "\"id\":\"$ZONE_ID\"" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  Zone ID: $ZONE_ID"
        echo "  Domain: $ZONE_NAME"
        echo ""
    done
    
    # Try to find istani.org zone
    ISTANI_ZONE=$(echo "$ZONES_RESPONSE" | grep -o '"id":"[^"]*".*"name":"istani[^"]*"' | head -1)
    if [ -n "$ISTANI_ZONE" ]; then
        ZONE_ID=$(echo "$ISTANI_ZONE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        print_success "Found istani.org zone: $ZONE_ID"
        echo ""
        echo "Add this to your .env or Vercel environment variables:"
        echo "CLOUDFLARE_ZONE_ID=$ZONE_ID"
    else
        print_warning "Could not find istani.org zone automatically"
        echo "Please select the Zone ID from the list above"
    fi
else
    ERROR_MSG=$(echo "$ZONES_RESPONSE" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$ERROR_MSG" ]; then
        print_error "Failed to fetch zones: $ERROR_MSG"
        if echo "$ERROR_MSG" | grep -q "location"; then
            echo ""
            print_warning "Your API token may have IP restrictions"
            echo "Get Zone ID manually from: https://dash.cloudflare.com -> Select domain -> Overview -> Zone ID"
        fi
    else
        print_error "Failed to fetch zones"
        echo "Response: $ZONES_RESPONSE"
    fi
fi

echo ""
print_status "Next steps:"
echo "1. Set CLOUDFLARE_ZONE_ID in your environment variables"
echo "2. Generate CLOUDFLARE_PURGE_SECRET: openssl rand -hex 32"
echo "3. Add both to Vercel: https://vercel.com/sano1233/istani-fitness/settings/environment-variables"
echo "4. Test the integration: curl -X GET https://istani.org/api/cloudflare/verify -H 'CLOUDFLARE_PURGE_SECRET: your-secret'"
