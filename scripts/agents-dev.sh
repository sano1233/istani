#!/bin/bash

# Start agents in development mode (Bash)
# Starts development agents with hot reload

set -e

echo "🤖 Starting agents in development mode..."

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
fi

# Start agents with development profile
echo "Starting development agents..."
docker-compose --profile dev up -d elevenlabs-agent fitness-agents

if [ $? -ne 0 ]; then
    echo "❌ Failed to start agents"
    exit 1
fi

echo "✅ Agents started successfully"
echo ""
echo "📋 Agent services:"
echo "  - ElevenLabs Agent: http://localhost:3001"
echo "  - Fitness Agents: http://localhost:3002"
echo ""
echo "💡 Useful commands:"
echo "  View logs: docker-compose logs -f elevenlabs-agent fitness-agents"
echo "  Stop agents: docker-compose stop elevenlabs-agent fitness-agents"

