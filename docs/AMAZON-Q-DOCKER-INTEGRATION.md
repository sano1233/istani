# Amazon Q Docker Integration

Complete Docker implementation with Amazon Q security best practices and enhanced coding workflows.

## Overview

This Docker setup follows [Docker's Getting Started Guide](https://docs.docker.com/get-started/) and integrates Amazon Q best practices for:
- ✅ Enhanced security
- ✅ Reduced errors
- ✅ Better code quality
- ✅ Automated workflows

## Security Features

### Amazon Q Security Best Practices

1. **Non-Root Execution**
   - All containers run as non-root users
   - Prevents privilege escalation attacks

2. **Minimal Attack Surface**
   - Multi-stage builds reduce image size
   - Only necessary files in final image
   - Alpine Linux base for minimal footprint

3. **Read-Only Filesystem**
   - Production containers use read-only filesystem
   - Temporary filesystems for writable directories

4. **Capability Restrictions**
   - Minimal capabilities (NET_BIND_SERVICE only)
   - No new privileges allowed

5. **Health Checks**
   - Automatic health monitoring
   - Container restart on failure

6. **Secrets Management**
   - Environment variables for sensitive data
   - No secrets in Dockerfiles or images
   - Support for Docker secrets and external secret managers

## Error Reduction

### Automated Checks

1. **Build-Time Validation**
   - TypeScript type checking
   - ESLint code quality checks
   - Build error detection

2. **Runtime Monitoring**
   - Health check endpoints
   - Automatic container restart
   - Log aggregation

3. **Development Tools**
   - Hot reload in development
   - Fast refresh for React components
   - Real-time error reporting

## Quick Start

### Build and Run

```bash
# Production
npm run docker:build
npm run docker:run

# Development
npm run docker:build:dev
npm run docker:run:dev
```

### Stop and Clean

```bash
# Stop containers
npm run docker:stop

# Clean up resources
npm run docker:clean
```

## Amazon Q Integration

### Code Quality

Amazon Q helps ensure:
- ✅ Secure Docker configurations
- ✅ Best practice implementations
- ✅ Error-free builds
- ✅ Security compliance

### Automated Workflows

1. **Build Validation**
   - Amazon Q reviews Dockerfiles
   - Security scanning
   - Best practice checks

2. **Runtime Monitoring**
   - Health check integration
   - Error detection
   - Performance monitoring

3. **Deployment Safety**
   - Pre-deployment checks
   - Security scanning
   - Configuration validation

## Security Checklist

- [x] Non-root user execution
- [x] Read-only filesystem
- [x] Minimal capabilities
- [x] Health checks enabled
- [x] Secrets in environment variables
- [x] No secrets in images
- [x] Regular base image updates
- [x] Vulnerability scanning
- [x] Log management
- [x] Network isolation

## Best Practices

### Development

1. Use development profile for local work
2. Enable hot reload for faster iteration
3. Use volume mounts for code changes
4. Monitor logs for errors

### Production

1. Use multi-stage builds
2. Enable health checks
3. Use read-only filesystem
4. Run as non-root user
5. Scan images for vulnerabilities
6. Use secrets management
7. Monitor container health
8. Set resource limits

## Monitoring

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check container health
docker ps
docker inspect istani-fitness-app | grep Health
```

### Logs

```bash
# Application logs
docker-compose logs -f app

# All services
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 app
```

### Metrics

```bash
# Container stats
docker stats

# Resource usage
docker stats istani-fitness-app
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   docker-compose build --no-cache
   ```

2. **Permission Errors**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Port Conflicts**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"
   ```

4. **Health Check Failures**
   ```bash
   # Check logs
   docker-compose logs app
   # Verify health endpoint
   curl http://localhost:3000/api/health
   ```

## Related Documentation

- `docs/DOCKER-SETUP.md` - Complete Docker setup guide
- `docs/AMAZON-Q-LOGS-FIX.md` - Amazon Q log management
- `docs/POWERSHELL-COMPATIBILITY.md` - Cross-platform scripts
- [Docker Getting Started](https://docs.docker.com/get-started/)

## Support

For Amazon Q specific issues:
1. Check Amazon Q logs (excluded from Git)
2. Review security configurations
3. Verify environment variables
4. Check health endpoints

