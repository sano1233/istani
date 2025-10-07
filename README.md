## ISTANI

[![Netlify Status](https://api.netlify.com/api/v1/badges/06176c52-805a-4be2-a8eb-732e5ab0f184/deploy-status)](https://app.netlify.com/projects/istani/deploys)

## Deployment workflow

Use the provided `deploy.sh` helper script to reproduce the production build locally:

```bash
./deploy.sh
```

The script ensures dependencies are installed (when the `node_modules` directory is missing), runs the test suite, and triggers the bundled production build.

## Tooling

Some development utilities expect the `@openai/codex` CLI to be available globally. Install it with:

```bash
npm i -g @openai/codex
```

## Security

Requests are filtered with an Arcjet-powered Netlify function at `netlify/functions/protect.mjs` to block common attacks and unwanted bots.
