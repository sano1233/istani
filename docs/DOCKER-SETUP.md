# Docker Setup Guide

Complete Docker implementation following [Docker's Getting Started Guide](https://docs.docker.com/get-started/) with Amazon Q security best practices.

## Overview

This project uses multi-stage Docker builds for optimal image size, security, and performance. All configurations follow Docker best practices and Amazon Q security guidelines.

## Quick Start

### Production Build

```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run

# Or use Docker Compose directly
docker-compose up -d
```

### Development Build

```bash
# Build development image
npm run docker:build:dev

# Run development container with hot reload
npm run docker:run:dev
```

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses three stages:

1. **deps** - Install production dependencies only
2. **builder** - Build the Next.js application
3. **runner** - Minimal runtime image with only necessary files

### Security Features

- ✅ Non-root user execution
- ✅ Read-only filesystem
- ✅ Minimal capabilities (NET_BIND_SERVICE only)
- ✅ Health checks
- ✅ No new privileges
- ✅ Temporary filesystems for writable directories

## Files Structure

```
.
├── Dockerfile              # Production multi-stage build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore           # Files to exclude from build
└── scripts/
    ├── docker-build.ps1    # PowerShell build script
    ├── docker-build.sh     # Bash build script
    ├── docker-run.ps1      # PowerShell run script
    └── docker-run.sh       # Bash run script
```

## Environment Variables

Create `.env.production` for production:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
REDIS_PASSWORD=your_redis_password
```

Create `.env.local` for development:

```env
NODE_ENV=development
# ... same variables as above
```

## Docker Commands

### Build Commands

```bash
# Production build
npm run docker:build
# or
docker build -t istani-fitness:latest .

# Development build
npm run docker:build:dev
# or
docker build -f Dockerfile.dev -t istani-fitness:dev .

# Build without cache
docker build --no-cache -t istani-fitness:latest .
```

### Run Commands

```bash
# Production (detached)
docker-compose up -d

# Production (attached)
docker-compose up

# Development
docker-compose --profile dev up

# Stop containers
npm run docker:stop
# or
docker-compose down

# View logs
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh
```

### Management Commands

```bash
# Clean up Docker resources
npm run docker:clean

# View running containers
docker ps

# View images
docker images | grep istani-fitness

# Remove containers
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## Docker Compose Services

### Production Services

- **app** - Next.js application (port 3000)
- **redis** - Redis cache (port 6379)

### Development Services

- **app-dev** - Development server with hot reload
- **postgres** - Local PostgreSQL (port 5432, profile: dev/local)

## Health Checks

All services include health checks:

```bash
# Check app health
curl http://localhost:3000/api/health

# Check container health
docker ps  # Look for "healthy" status
```

## Security Best Practices

### Implemented

1. **Non-root user** - Application runs as `nextjs` user (UID 1001)
2. **Read-only filesystem** - Container filesystem is read-only
3. **Minimal capabilities** - Only NET_BIND_SERVICE capability
4. **No new privileges** - Prevents privilege escalation
5. **Temporary filesystems** - /tmp and /var/tmp are tmpfs
6. **Secrets management** - Environment variables via .env files
7. **Image scanning** - Use `docker scan` to check for vulnerabilities

### Amazon Q Security Integration

- ✅ No secrets in Dockerfiles
- ✅ Environment variables for sensitive data
- ✅ Minimal base images (Alpine Linux)
- ✅ Multi-stage builds to reduce attack surface
- ✅ Regular security updates
- ✅ Health checks for monitoring

## Troubleshooting

### Build Issues

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache

# Check build logs
docker-compose build --progress=plain
```

### Runtime Issues

```bash
# Check container logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart services
docker-compose restart

# Access container shell
docker-compose exec app sh
```

### Port Conflicts

If port 3000 is already in use:

```yaml
# In docker-compose.yml, change:
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run Docker with proper user
docker-compose run --rm app sh
```

## Production Deployment

### Build for Production

```bash
# Build optimized image
npm run docker:build

# Tag for registry
docker tag istani-fitness:latest your-registry/istani-fitness:latest

# Push to registry
docker push your-registry/istani-fitness:latest
```

### Deploy to Cloud

#### AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag istani-fitness:latest your-account.dkr.ecr.us-east-1.amazonaws.com/istani-fitness:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/istani-fitness:latest
```

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/your-project/istani-fitness
gcloud run deploy istani-fitness --image gcr.io/your-project/istani-fitness
```

#### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry your-registry --image istani-fitness:latest .
```

## Monitoring

### Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

### Logs

```bash
# Follow logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Specific service
docker-compose logs redis
```

### Metrics

Monitor container resources:

```bash
# Container stats
docker stats

# Specific container
docker stats istani-fitness-app
```

## Best Practices

1. **Always use multi-stage builds** - Reduces final image size
2. **Use .dockerignore** - Excludes unnecessary files
3. **Pin base image versions** - Use specific tags, not `latest`
4. **Run as non-root** - Security best practice
5. **Use health checks** - Monitor container health
6. **Keep images updated** - Regularly update base images
7. **Scan for vulnerabilities** - Use `docker scan`
8. **Use secrets management** - Never hardcode secrets

## Amazon Q Integration

This Docker setup is fully compatible with Amazon Q:

- ✅ Secure configuration
- ✅ Best practices implementation
- ✅ Error reduction through proper health checks
- ✅ Security hardening
- ✅ Log management
- ✅ Environment variable handling

## Related Documentation

- [Docker Getting Started](https://docs.docker.com/get-started/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- `docs/AMAZON-Q-LOGS-FIX.md` - Amazon Q log management
- `docs/POWERSHELL-COMPATIBILITY.md` - Cross-platform scripts

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Verify environment variables
3. Check health endpoint: `curl http://localhost:3000/api/health`
4. Review this documentation

