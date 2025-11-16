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

## Automated PR reviews

Use the `scripts/auto-review.mjs` helper to request an OpenAI-powered code review before merging pull requests. It relies on the GitHub CLI and the `OPENAI_API_KEY` environment variable:

```bash
OPENAI_API_KEY=sk-your-key node scripts/auto-review.mjs 123
```

Pass `--merge` to automatically squash-merge the pull request when the model issues an approval with no blocking concerns:

```bash
OPENAI_API_KEY=sk-your-key node scripts/auto-review.mjs 123 --merge
```

The reviewer summarizes the change, lists any concerns, surfaces recommended checks, and exits with a non-zero status if merging is blocked.
