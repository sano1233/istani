# Docker Quick Start

Complete Docker implementation with Amazon Q integration for enhanced security and error reduction.

## Quick Commands

```bash
# Start all Docker services
npm run docker:up

# Start agents in development
npm run agents:dev

# Clear Amazon Q logs
npm run logs:clear

# Archive Amazon Q logs
npm run logs:archive
```

## Full Command List

### Docker Services

- `npm run docker:up` - Start all Docker services
- `npm run docker:stop` - Stop all Docker services
- `npm run docker:build` - Build production image
- `npm run docker:build:dev` - Build development image
- `npm run docker:clean` - Clean Docker resources

### Agents

- `npm run agents:dev` - Start development agents (ElevenLabs, Fitness)

### Log Management

- `npm run logs:clear` - Clear all Amazon Q logs
- `npm run logs:archive` - Archive Amazon Q logs before clearing

## Getting Started

1. **Build and start services:**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Start development agents:**
   ```bash
   npm run agents:dev
   ```

3. **Access services:**
   - App: http://localhost:3000
   - ElevenLabs Agent: http://localhost:3001
   - Fitness Agents: http://localhost:3002
   - Redis: localhost:6379

## Amazon Q Integration

All scripts are compatible with Amazon Q and include:
- ✅ Security best practices
- ✅ Error reduction
- ✅ Automated log management
- ✅ Cross-platform support (PowerShell & Bash)

## Documentation

- `docs/DOCKER-SETUP.md` - Complete Docker setup guide
- `docs/DOCKER-COMMANDS.md` - Command reference
- `docs/AMAZON-Q-DOCKER-INTEGRATION.md` - Amazon Q integration details

## Support

For issues, check:
1. Docker logs: `docker-compose logs -f`
2. Container status: `docker-compose ps`
3. Health checks: `curl http://localhost:3000/api/health`

