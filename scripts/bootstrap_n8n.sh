#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Bootstrapping n8n integration for ISTANI..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ docker-compose not found. Please install Docker Compose."
  exit 1
fi

echo "📦 Starting n8n services..."
docker compose -f docker-compose.yml -f compose.n8n.yml up -d n8n-db n8n

echo "⏳ Waiting for n8n to be ready..."
sleep 10

# Copy mu-plugin into WordPress volume (if WordPress container exists)
if docker ps --format '{{.Names}}' | grep -q wordpress; then
  echo "📂 Copying WordPress mu-plugin..."
  docker compose cp wp-mu-plugins/istani-n8n.php wordpress:/var/www/html/wp-content/mu-plugins/ || {
    echo "⚠️  Could not copy mu-plugin. WordPress container may not be running."
    echo "   Run this manually: docker compose cp wp-mu-plugins/. wordpress:/var/www/html/wp-content/mu-plugins/"
  }
else
  echo "⚠️  WordPress container not found. Skipping mu-plugin copy."
  echo "   Start WordPress first: docker compose up -d wordpress"
  echo "   Then run: docker compose cp wp-mu-plugins/. wordpress:/var/www/html/wp-content/mu-plugins/"
fi

echo ""
echo "✅ n8n is running at http://localhost:5678"
echo ""
echo "📋 Next steps:"
echo "   1. Visit http://localhost:5678 to set up n8n"
echo "   2. Workflows are auto-imported from n8n/workflows/"
echo "   3. Configure GitHub token in n8n environment (GITHUB_TOKEN)"
echo "   4. Test webhooks:"
echo ""
echo "      # Test WordPress contact webhook:"
echo "      curl -X POST http://localhost:5678/webhook/wp-contact \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'X-Istani-Signature: HMAC_HERE' \\"
echo "        -d '{\"data\":{\"name\":\"Test\",\"email\":\"test@example.com\"}}'"
echo ""
echo "      # Test GitHub PR creation:"
echo "      curl -X POST http://localhost:5678/webhook/github-create-pr \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'X-Istani-Signature: HMAC_HERE' \\"
echo "        -d '{\"branch\":\"test/auto-pr\",\"title\":\"Test PR\",\"body\":\"Auto-created\"}'"
echo ""
echo "🔒 Remember to:"
echo "   - Change N8N_ENCRYPTION_KEY in compose.n8n.yml"
echo "   - Change ISTANI_N8N_SHARED_SECRET in .env"
echo "   - Add GITHUB_TOKEN to n8n environment for PR creation"
echo ""
