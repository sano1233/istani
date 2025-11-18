#!/bin/bash

# Start all Docker services (Bash)
# Starts all services defined in docker-compose.yml

set -e

DETACHED=false
BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo "🚀 Starting all Docker services..."

COMPOSE_ARGS="up"

if [ "$BUILD" = true ]; then
    echo "Building images first..."
    COMPOSE_ARGS="$COMPOSE_ARGS --build"
fi

if [ "$DETACHED" = true ]; then
    echo "Starting in detached mode..."
    COMPOSE_ARGS="$COMPOSE_ARGS -d"
else
    echo "Starting in attached mode (Ctrl+C to stop)..."
fi

docker-compose $COMPOSE_ARGS

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker services"
    exit 1
fi

echo "✅ Docker services started successfully"

if [ "$DETACHED" = true ]; then
    echo ""
    echo "📋 Running containers:"
    docker-compose ps
    
    echo ""
    echo "💡 Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: npm run docker:stop"
    echo "  Check status: docker-compose ps"
fi

