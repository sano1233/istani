#!/bin/bash

# Docker Build Script (Bash)
# Builds Docker images with security best practices

set -e

TARGET=${1:-production}
NO_CACHE=${2:-false}
PUSH=${3:-false}

echo "🐳 Building Docker image..."

BUILD_ARGS=""
if [ "$NO_CACHE" = "true" ]; then
    BUILD_ARGS="--no-cache"
fi

if [ "$TARGET" = "production" ]; then
    echo "Building production image..."
    docker build -t istani-fitness:latest -t istani-fitness:$(date +%Y%m%d-%H%M%S) $BUILD_ARGS .
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    
    echo "✅ Production image built successfully"
    
    if [ "$PUSH" = "true" ]; then
        echo "Pushing to registry..."
        docker push istani-fitness:latest
    fi
elif [ "$TARGET" = "dev" ]; then
    echo "Building development image..."
    docker build -f Dockerfile.dev -t istani-fitness:dev $BUILD_ARGS .
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    
    echo "✅ Development image built successfully"
else
    echo "❌ Invalid target. Use 'production' or 'dev'"
    exit 1
fi

echo ""
echo "📦 Available images:"
docker images | grep istani-fitness

