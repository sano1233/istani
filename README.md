# ISTANI Monorepo

Unified monorepo containing all ISTANI projects and tools.

## Structure

This repository uses a monorepo structure with all packages located in the `packages/` directory.

### Packages

The following 23 packages are included in this monorepo, with 4 large repositories referenced externally:

#### Core Projects
- **istani-legacy** - Original ISTANI website and AI brain
- **n8n** - Workflow automation
- **saas-starter** - SaaS application starter kit
- **self-hosted-ai-agent-starter-kit** - Self-hosted AI agent starter

#### Next.js / Web Projects
- **nextjs** - Next.js framework
- **next.js** - Next.js repository
- **nextjs-subscription-payments** - Subscription payment system
- **saas-starter** - SaaS starter template

#### AI & ML Tools
- **claude-code** - Claude Code tools
- **claude-code-action** - Claude Code GitHub Actions
- **ClaudeSync** - Claude synchronization tools
- **ollama** - Local LLM runner
- **gemini-cli** - Google Gemini CLI
- **codex** - OpenAI Codex tools

**Large Repositories (Referenced Externally):**
- **claude-cookbooks** - [sano1233/claude-cookbooks](https://github.com/sano1233/claude-cookbooks) (202MB)
- **openai-cookbook** - [sano1233/openai-cookbook](https://github.com/sano1233/openai-cookbook) (686MB)
- **llama.cpp** - [sano1233/llama.cpp](https://github.com/sano1233/llama.cpp) (96MB)
- **hyperswitch** - [sano1233/hyperswitch](https://github.com/sano1233/hyperswitch) (169MB)

#### CLI & Development Tools
- **cli** - General CLI tools
- **node-windows** - Node.js Windows service wrapper
- **nvm-windows** - Node Version Manager for Windows

#### Databases & Backend
- **supabase-js** - Supabase JavaScript client
- **supabase-py** - Supabase Python client
- **nestjs-supabase-auth** - NestJS Supabase authentication
- **pg_cron** - PostgreSQL cron job scheduler

#### Infrastructure & Cloud
- **mcp-server-cloudflare** - Cloudflare MCP server

#### Misc
- **sano1233** - Personal profile repository
- **FREE-FITNESS-WORKOUT-GYM-MEAL-CALCULATOR-GUIDE** - Fitness guide
- **hsdhxhrndndnndndhdhjdnndndndndndn** - Utility package

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install all dependencies across all packages
npm install

# Run builds
npm run build

# Run tests
npm run test
```

### Working with Individual Packages

Each package can be worked on independently:

```bash
cd packages/<package-name>
npm install
npm run dev
```

## Development

This monorepo was created by merging 32+ separate repositories into a single unified codebase using git subtree merge strategy, preserving full git history for each package.

### Monorepo Benefits

- **Unified Version Control**: Single source of truth for all projects
- **Shared Dependencies**: Reduce duplication and ensure consistency
- **Cross-Package Refactoring**: Make changes across multiple packages easily
- **Atomic Commits**: Changes spanning multiple packages in single commits
- **Simplified CI/CD**: Single pipeline for all packages

## Repository Structure

```
istani/
├── packages/
│   ├── istani-legacy/          # Original ISTANI website
│   ├── hyperswitch/            # Payment infrastructure
│   ├── n8n/                    # Workflow automation
│   ├── claude-code/            # Claude Code tools
│   ├── ollama/                 # Local LLM runner
│   └── ... (22 more packages)
├── scripts/                    # Build and automation scripts
├── package.json                # Root package.json with workspaces
└── README.md                   # This file
```

## Scripts

- `npm run test` - Run tests across all packages
- `npm run build` - Build all packages
- `npm run clean` - Clean all node_modules directories
- `npm run lint` - Lint all packages

## Contributing

When working on this monorepo:

1. Create feature branches from `main`
2. Make changes in relevant packages
3. Test changes locally
4. Commit with descriptive messages
5. Push and create pull requests

## License

MIT

## Author

sano1233
