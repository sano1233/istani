# Docker Commands Reference

Quick reference guide for all Docker and Amazon Q log management commands.

## Docker Commands

### Start Services

```bash
# Start all Docker services
npm run docker:up

# Start in detached mode (background)
npm run docker:up -- --detached

# Start with rebuild
npm run docker:up -- --build
```

### Build Images

```bash
# Build production image
npm run docker:build

# Build development image
npm run docker:build:dev

# Build without cache
npm run docker:build -- --no-cache
```

### Run Containers

```bash
# Run production containers
npm run docker:run

# Run development containers
npm run docker:run:dev
```

### Stop Services

```bash
# Stop all containers
npm run docker:stop

# Stop and remove volumes
docker-compose down -v
```

### Clean Up

```bash
# Clean Docker resources
npm run docker:clean

# Remove all containers and images
docker system prune -a
```

## Agent Commands

### Development Agents

```bash
# Start agents in development mode
npm run agents:dev

# View agent logs
docker-compose logs -f elevenlabs-agent fitness-agents

# Stop agents
docker-compose stop elevenlabs-agent fitness-agents
```

## Amazon Q Log Management

### Clear Logs

```bash
# Clear all Amazon Q logs
npm run logs:clear
```

### Archive Logs

```bash
# Archive Amazon Q logs before clearing
npm run logs:archive
```

Archives are saved to `logs-archive/amazon-q-logs-YYYYMMDD-HHMMSS/`

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start all Docker services |
| `npm run docker:stop` | Stop all Docker services |
| `npm run docker:build` | Build production image |
| `npm run docker:build:dev` | Build development image |
| `npm run docker:clean` | Clean Docker resources |
| `npm run agents:dev` | Start development agents |
| `npm run logs:clear` | Clear Amazon Q logs |
| `npm run logs:archive` | Archive Amazon Q logs |

## Common Workflows

### Development Setup

```bash
# 1. Build development image
npm run docker:build:dev

# 2. Start all services
npm run docker:up

# 3. Start agents
npm run agents:dev
```

### Production Deployment

```bash
# 1. Build production image
npm run docker:build

# 2. Start production services
npm run docker:up -- --detached
```

### Log Management

```bash
# 1. Archive logs first
npm run logs:archive

# 2. Clear logs
npm run logs:clear
```

## Troubleshooting

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Check Status

```bash
# Running containers
docker-compose ps

# Container stats
docker stats

# Health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

## Related Documentation

- `docs/DOCKER-SETUP.md` - Complete Docker setup guide
- `docs/AMAZON-Q-DOCKER-INTEGRATION.md` - Amazon Q integration
- `docs/AMAZON-Q-LOGS-FIX.md` - Log management details

