# Istani Autonomous AI Platform - Architecture

## System Overview

The Istani platform is a production-ready autonomous AI system built on Next.js 15 with TypeScript, implementing defense-in-depth security, multi-AI orchestration, and fully autonomous operations.

## Core Components

### 1. AI Security Framework (`lib/ai-security/`)

#### Confidence Scoring (`confidence.ts`)
- Uses OpenAI token logprobs for mathematical certainty
- Geometric mean calculation prevents masking of uncertain tokens
- Threshold ≥0.99 achieves 95% precision with 70% display rate
- Returns structured results with confidence, token count, and abstention status

#### Defense System (`defense.ts`)
- **Layer 1**: Perplexity-based injection detection
  - Calculates perplexity from token logprobs
  - Threshold > 5.0 indicates adversarial input
- **Layer 2**: Input sanitization
  - Filters known injection patterns
  - Removes meta-instructions
- **Layer 3**: Sandwich prompting
  - Random delimiters separate instructions from data
  - Prevents instruction injection via clear boundaries
- **Layer 4**: Secure generation
  - Uses confidence scoring
  - Temperature=0 for deterministic output
- **Layer 5**: Output validation
  - Prevents system prompt leakage
  - Blocks credential exposure

#### Abstention Handling (`abstention.ts`)
- Detects full and partial uncertainty patterns
- Normalizes "I don't know" responses
- Prevents low-quality hallucinated answers

### 2. Multi-AI Orchestrator (`lib/autonomous/multi-ai-orchestrator.ts`)

Coordinates four AI models in parallel:
1. **OpenAI GPT-4o**: Security-first with full defense layers
2. **Anthropic Claude**: Highly reliable (0.95 confidence)
3. **Google Gemini**: Conflict resolution specialist
4. **Alibaba Qwen**: Alternative perspective (0.85 confidence)

**Consensus Logic**:
- Runs all models in parallel for speed
- Requires 2+ approvals for consensus
- Uses highest confidence response as primary
- Graceful degradation on failures

### 3. Autonomous Agent (`lib/autonomous/agent.ts`)

#### Auto-Analyze
- Analyzes PRs with multi-AI consensus
- Extracts structured data (summary, risks, recommendations)
- Stores analysis in Cloudflare KV for audit trail
- Returns approval decision with confidence score

#### Auto-Resolve
- Generates solutions for bugs and issues
- Quality-checks solution with all AI models
- Extracts code blocks for automated application
- Confidence threshold ensures safety

#### Auto-Merge
- Safety checks:
  1. Consensus approval (2+ AI models)
  2. High confidence (≥0.85)
  3. No critical risks
- In production, triggers GitHub API merge
- Comprehensive audit logging

#### Self-Learning
- Stores feedback for continuous improvement
- Future: Model weight updates, threshold adjustments
- Training data generation for fine-tuning

### 4. Cloudflare Integrations (`lib/cloudflare/`)

#### KV (`kv.ts`)
- Distributed edge caching
- REST API access from Vercel
- Sub-10ms global latency
- Used for: Analysis storage, feature flags, session data

#### R2 (`r2.ts`)
- S3-compatible object storage
- Zero egress fees (vs AWS S3)
- Signed URLs for temporary access
- Used for: File uploads, screenshots, generated artifacts

#### Workers AI (`workers-ai.ts`)
- Edge inference at 50ms cold start
- Text generation, embeddings, image classification
- Neuron-based pricing
- Used for: Lightweight AI tasks, semantic search

#### Browser Rendering (`browser-rendering.ts`)
- Headless Chrome at the edge
- Screenshots, PDFs, content extraction
- AI-powered JSON extraction
- Used for: Web scraping, preview generation

### 5. Security Infrastructure (`lib/security/`)

#### Rate Limiting (`rate-limit.ts`)
- **Global**: 100 req/min per IP
- **Auth**: 5 req/15min per IP
- **AI**: 20 req/min per user
- **Payments**: 10 req/min per user
- Upstash Redis sliding window algorithm
- Response headers with limit/remaining/reset

#### JWT Authentication (`jwt.ts`)
- HS256 algorithm with 256-bit secret
- 24-hour access tokens
- 7-day refresh tokens
- HttpOnly cookies prevent XSS
- Secure flag in production
- SameSite=Strict prevents CSRF

#### Middleware (`middleware.ts`)
- Content Security Policy with nonces
- Security headers (X-Frame-Options, etc.)
- Strict-Transport-Security with HSTS preload
- Permissions-Policy restricts capabilities
- Applied to all routes except static files

### 6. API Integrations (`lib/apis/`, `lib/payments/`)

#### Stripe (`payments/stripe.ts`)
- Payment Intents (modern API)
- Webhook signature verification
- Subscription management
- Customer creation and management

#### Hugging Face (`apis/huggingface.ts`)
- Text generation, embeddings, classification
- Model and dataset search
- Question answering, summarization

#### PubMed (`apis/pubmed.ts`)
- Research paper search
- Article summaries and details
- Related article discovery
- Rate limiting (3 req/sec, 10 with API key)

## API Routes (`app/api/`)

### `/api/ai/generate`
**Security Layers**:
1. Rate limiting (20 req/min per user)
2. JWT authentication (optional)
3. Zod input validation
4. 5-layer AI security
5. Confidence threshold enforcement
6. Response validation

**Flow**:
```
Request → Rate Limit → Auth → Validate → Secure AI → Confidence Check → Response
```

### `/api/autonomous/analyze`
**Capabilities**:
- PR analysis with multi-AI consensus
- Issue auto-resolution
- Code review with recommendations

**Flow**:
```
Request → Rate Limit → Validate → Agent Analysis → Multi-AI Consensus → Response
```

### `/api/webhooks/github`
**Security**:
- HMAC signature verification
- Timing-safe comparison

**Flow**:
```
Webhook → Verify Signature → Parse Event → Auto-Analyze → Auto-Merge → Response
```

### `/api/health`
**Checks**:
- All 4 AI model availability
- Response time measurement
- Status: healthy | degraded | down

## Data Flow

### Secure AI Generation
```
User Prompt
    ↓
[Layer 1: Injection Detection]
    ↓ (if safe)
[Layer 2: Sanitization]
    ↓
[Layer 3: Sandwich Prompting]
    ↓
[Layer 4: OpenAI API with Logprobs]
    ↓
[Confidence Calculation: exp(mean(logprobs))]
    ↓
[Layer 5: Output Validation]
    ↓ (if ≥0.99 confidence)
Response to User
```

### Multi-AI Consensus
```
Analysis Request
    ↓
[Parallel Execution]
    ├─ Claude
    ├─ Gemini
    ├─ OpenAI (secure)
    └─ Qwen
    ↓
[Collect Responses]
    ↓
[Count Approvals]
    ↓
[Consensus ≥ 2 approvals]
    ↓
Decision: Approve/Reject
```

### Autonomous PR Processing
```
GitHub Webhook (PR opened)
    ↓
[Verify Signature]
    ↓
[Fetch PR Files via GitHub API]
    ↓
[Agent: Analyze PR]
    ↓
[Multi-AI Consensus]
    ↓
[Extract: Summary, Risks, Recommendations]
    ↓
[Store Analysis in KV]
    ↓
[Safety Checks]
    ├─ Consensus approved?
    ├─ Confidence ≥ 0.85?
    └─ No critical risks?
    ↓ (if all pass)
[Trigger GitHub Merge]
    ↓
[Post Comment with Analysis]
```

## Deployment Architecture

### Vercel Edge Network
- **Edge Functions**: CSP middleware, health checks
- **Serverless Functions**: API routes (60s timeout)
- **Static Assets**: /site folder (legacy site)

### Cloudflare Edge
- **KV**: Analysis cache, session storage
- **R2**: File storage, artifacts
- **Workers AI**: Lightweight inference

### External Services
- **OpenAI**: Primary AI + security
- **Anthropic**: High-confidence analysis
- **Google**: Conflict resolution
- **Alibaba**: Alternative opinions
- **Upstash Redis**: Rate limiting
- **Stripe**: Payment processing
- **GitHub**: Webhook source

## Security Model

### Zero Trust Principles
1. **Never trust user input** - All inputs validated with Zod
2. **Always verify authenticity** - JWT tokens, webhook signatures
3. **Limit blast radius** - Rate limiting prevents abuse
4. **Defense in depth** - Multiple security layers
5. **Least privilege** - API keys scoped to minimum permissions

### OWASP API Security Top 10 Coverage
1. **Broken Object Level Authorization** - JWT per-user authorization
2. **Broken Authentication** - Secure JWT with HttpOnly cookies
3. **Broken Object Property Level Authorization** - Zod schemas enforce structure
4. **Unrestricted Resource Consumption** - Rate limiting on all endpoints
5. **Broken Function Level Authorization** - Role-based checks (future)
6. **Unrestricted Access to Sensitive Business Flows** - Multi-factor approval for merge
7. **Server Side Request Forgery** - URL validation on external fetches
8. **Security Misconfiguration** - Strict CSP, security headers
9. **Improper Inventory Management** - /api/health endpoint
10. **Unsafe Consumption of APIs** - Signature verification on webhooks

## Performance Characteristics

### Latency Targets
- **Edge Middleware**: <5ms (CSP headers)
- **Cloudflare KV Read**: <10ms global
- **Cloudflare Workers AI**: ~50ms cold start
- **OpenAI API**: ~500-2000ms (depends on tokens)
- **Multi-AI Consensus**: ~2000-5000ms (parallel execution)

### Throughput Limits
- **Rate Limits**: 100 req/min per IP
- **AI Generation**: 20 req/min per user
- **Webhook Processing**: ~60s max timeout

### Scaling Considerations
- **Serverless**: Auto-scales with traffic
- **Cloudflare KV**: Unlimited reads (rate limited)
- **AI APIs**: External rate limits apply
- **Redis**: Upstash handles scaling

## Future Enhancements

### Planned Features
1. **Database Layer**: PostgreSQL for persistent storage
2. **User Dashboard**: View analysis history
3. **Fine-tuned Models**: Custom models on successful outcomes
4. **Advanced Monitoring**: Sentry, Datadog integration
5. **A/B Testing**: Experiment with different confidence thresholds
6. **Cost Optimization**: Cache frequent queries in KV
7. **Webhook Management UI**: Configure webhooks in dashboard
8. **Team Collaboration**: Multi-user support with RBAC

### Research Directions
1. **Confidence Calibration**: Improve threshold selection
2. **Adversarial Testing**: Red team prompt injection attacks
3. **Model Performance**: Compare AI model accuracy over time
4. **Consensus Algorithms**: Weighted voting by historical accuracy
5. **Explainability**: Why did the AI approve/reject?

## Monitoring & Observability

### Key Metrics
- AI model availability (4 models)
- Average confidence scores
- Approval rate (consensus)
- Response times (p50, p95, p99)
- Error rates by endpoint
- Rate limit violations
- Security events (injection attempts)

### Logging Strategy
- Structured JSON logs
- No sensitive data logged (API keys, tokens)
- Audit trail for all autonomous actions
- Correlation IDs for request tracing

### Alerting
- AI service degradation
- High error rates (>5%)
- Security events
- Rate limit threshold breaches
- Performance degradation (p95 > 5s)

---

**Version**: 2.0.0
**Last Updated**: November 2025
**Maintainer**: Istani Development Team
