# 🚀 FitAI Full Stack Deployment Guide

Complete deployment guide for the FitAI AI-powered fitness SaaS platform with all integrated services.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Environment Setup](#environment-setup)
4. [Development](#development)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** 20.10+
- **Node.js** 20+
- **npm** 9+
- **Git**

### Local Development (Full Stack)

```bash
# Clone repository
git clone https://github.com/sano1233/istani.git
cd istani

# Copy environment variables
cp .env.production.example .env

# Edit .env with your API keys
nano .env

# Start all services
docker-compose -f docker-compose.full-stack.yml up -d

# Check service health
docker-compose -f docker-compose.full-stack.yml ps

# View logs
docker-compose -f docker-compose.full-stack.yml logs -f
```

### Access Points

- **Main App**: http://localhost:3000
- **ElevenLabs Agent**: http://localhost:3002
- **AI Agent**: http://localhost:3001
- **n8n Automation**: http://localhost:5678
- **Grafana Monitoring**: http://localhost:3003
- **Prometheus**: http://localhost:9090
- **Qdrant Vector DB**: http://localhost:6333
- **Ollama AI**: http://localhost:11434

---

## 🏗️ Architecture Overview

### Services Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx Reverse Proxy                   │
│                         (Port 80/443)                        │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────────────────┐
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐         │
│  │  Next.js    │  │ ElevenLabs   │  │  AI Agent   │         │
│  │ Frontend    │  │    Agent     │  │  (Auto ops) │         │
│  │  :3000      │  │    :3002     │  │   :3001     │         │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘         │
│         │                │                  │                 │
│  ┌──────┴────────────────┴──────────────────┴──────┐         │
│  │                                                   │         │
│  │  ┌─────────┐  ┌──────┐  ┌────────┐  ┌────────┐ │         │
│  │  │  n8n    │  │ Redis│  │ Qdrant │  │ Ollama │ │         │
│  │  │  :5678  │  │ :6379│  │ :6333  │  │ :11434 │ │         │
│  │  └────┬────┘  └───┬──┘  └───┬────┘  └───┬────┘ │         │
│  │       │           │         │            │      │         │
│  │  ┌────┴───────────┴─────────┴────────────┴────┐ │         │
│  │  │          PostgreSQL Database               │ │         │
│  │  │               :5432                         │ │         │
│  │  └────────────────────────────────────────────┘ │         │
│  │                                                   │         │
│  └───────────────────────────────────────────────────┘         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Monitoring Stack: Prometheus + Grafana             │    │
│  │      :9090               :3003                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### AI Integration Layer

The platform includes a **Unified AI Client** that intelligently routes requests across multiple AI providers:

1. **Primary**: Anthropic Claude 3.5 Sonnet (best reasoning)
2. **Fallback 1**: OpenAI GPT-4 Turbo (reliability)
3. **Fallback 2**: OpenRouter (multi-model access)
4. **Fallback 3**: Ollama (local/free alternative)

### Features

✅ **AI-Powered Coaching** - Personalized workout & nutrition plans
✅ **Voice Assistant** - ElevenLabs conversational AI
✅ **Workflow Automation** - n8n for user onboarding & notifications
✅ **Vector Search** - Qdrant for RAG-based recommendations
✅ **Local AI** - Ollama for privacy-first inference
✅ **Real-time Monitoring** - Prometheus + Grafana
✅ **Caching & Queues** - Redis for performance
✅ **Multi-Model Support** - 8+ AI models via OpenRouter

---

## 🔧 Environment Setup

### Required Environment Variables

See `.env.production.example` for the complete list. Key variables:

#### Core Platform

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_live_your-key
```

#### AI Services

```env
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
OPENROUTER_API_KEY=sk-or-v1-your-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

#### Google APIs

```env
GOOGLE_CALENDAR_API_KEY=your-calendar-key
GOOGLE_DRIVE_API_KEY=your-drive-key
```

#### Workflow Automation

```env
N8N_ENCRYPTION_KEY=generate-secure-64-char-key
N8N_ISTANI_SHARED_SECRET=generate-secure-secret
N8N_DB_PASSWORD=secure-db-password
```

### Generate Secrets

```bash
# N8N encryption key
openssl rand -hex 32

# Shared secrets
openssl rand -hex 32

# JWT secret
openssl rand -base64 64
```

---

## 💻 Development

### Start Development Environment

```bash
# Option 1: Full stack with Docker
docker-compose -f docker-compose.full-stack.yml up -d

# Option 2: Just Next.js (use external services)
npm run dev
```

### Development Tools

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### Run Individual Services

```bash
# ElevenLabs agent only
cd elevenlabs-agent
npm install
npm start

# AI agent only
cd ai-agent
npm install
npm start
```

---

## 🚀 Production Deployment

### Option 1: Full Stack with Docker (Recommended)

```bash
# 1. Set up environment
cp .env.production.example .env
nano .env  # Add all production keys

# 2. Build and start
docker-compose -f docker-compose.full-stack.yml up -d --build

# 3. Initialize Ollama models (optional)
docker exec -it istani-ollama ollama pull llama3.1:70b
docker exec -it istani-ollama ollama pull codellama

# 4. Check health
curl http://localhost:3000/api/health
curl http://localhost:3002/health
curl http://localhost:3001/health

# 5. View logs
docker-compose -f docker-compose.full-stack.yml logs -f
```

### Option 2: Vercel + External Services

```bash
# Deploy Next.js to Vercel
vercel --prod

# Deploy ElevenLabs agent to Railway/Heroku
cd elevenlabs-agent
railway up  # or heroku git:push
```

### Option 3: Kubernetes (Enterprise)

```bash
# Coming soon: Kubernetes manifests
kubectl apply -f k8s/
```

---

## 📊 Monitoring & Maintenance

### Access Monitoring

- **Grafana**: http://localhost:3003 (admin / your-password)
- **Prometheus**: http://localhost:9090

### Pre-built Dashboards

Import these Grafana dashboards:

- **Node.js Apps**: Dashboard ID 11159
- **Redis**: Dashboard ID 11835
- **PostgreSQL**: Dashboard ID 9628
- **Nginx**: Dashboard ID 12708

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.full-stack.yml ps

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3002/health
curl http://localhost:3001/health
curl http://localhost:5678/healthz
curl http://localhost:6333/healthz

# Check logs
docker logs istani-nextjs
docker logs istani-elevenlabs
docker logs istani-n8n
```

### Database Backups

```bash
# Backup PostgreSQL (n8n data)
docker exec istani-postgres pg_dump -U n8n n8n > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i istani-postgres psql -U n8n n8n < backup_20251117.sql
```

### Update Services

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.full-stack.yml up -d --build

# Or specific service only
docker-compose -f docker-compose.full-stack.yml up -d --build nextjs-app
```

---

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.full-stack.yml logs [service-name]

# Restart service
docker-compose -f docker-compose.full-stack.yml restart [service-name]

# Full restart
docker-compose -f docker-compose.full-stack.yml down
docker-compose -f docker-compose.full-stack.yml up -d
```

### AI Services Not Responding

```bash
# Test AI endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "test"}
    ]
  }'

# Check API keys
docker exec istani-nextjs env | grep API_KEY

# Restart AI services
docker restart istani-nextjs istani-elevenlabs
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker exec istani-postgres pg_isready -U n8n

# Reset PostgreSQL
docker-compose -f docker-compose.full-stack.yml restart postgres

# Check Redis
docker exec istani-redis redis-cli ping
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit service resources (edit docker-compose.yml)
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G

# Restart with new limits
docker-compose -f docker-compose.full-stack.yml up -d
```

### SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d istani.org -d www.istani.org

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 📚 Additional Resources

- [FitAI Architecture Plan](./ISTANI_FULL_STACK_ARCHITECTURE.md)
- [ElevenLabs Integration](./ELEVENLABS-INTEGRATION.md)
- [n8n Workflows](./N8N_AUTOMATION_README.md)
- [API Documentation](./API-DOCS.md)
- [Security Guide](./SECURITY_FOR_BEGINNERS.md)

---

## 🆘 Support

**Issues**: https://github.com/sano1233/istani/issues
**Email**: istaniDOTstore@proton.me
**Donations**: https://buymeacoffee.com/istanifitn

---

**Built with ❤️ for the fitness community**
**100% Free. Open Source. Privacy-First.**
