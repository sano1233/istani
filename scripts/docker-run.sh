#!/bin/bash

# Docker Run Script (Bash)
# Runs Docker containers with proper configuration

set -e

MODE=${1:-production}
DETACHED=${2:-false}
BUILD=${3:-false}

echo "🚀 Starting Docker containers..."

if [ "$BUILD" = "true" ]; then
    echo "Building images first..."
    bash scripts/docker-build.sh $MODE
fi

if [ "$MODE" = "production" ]; then
    echo "Starting production containers..."
    if [ "$DETACHED" = "true" ]; then
        docker-compose up -d
    else
        docker-compose up
    fi
elif [ "$MODE" = "dev" ]; then
    echo "Starting development containers..."
    if [ "$DETACHED" = "true" ]; then
        docker-compose --profile dev up -d
    else
        docker-compose --profile dev up
    fi
else
    echo "❌ Invalid mode. Use 'production' or 'dev'"
    exit 1
fi

