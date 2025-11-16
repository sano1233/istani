# istani.org

This repository contains the static site for [istani.org](https://istani.org).

## Development

The site uses simple npm scripts. There is no build step.

```bash
npm install
npm test
```

### Generate link page

```bash
npm run generate:links
```

### Post to socials

```bash
npm run post
```

## Using Claude Code

Install the CLI (Node.js 18+ required):

```bash
npm install -g @anthropic-ai/claude-code
# or
curl -fsSL https://claude.ai/install.sh | bash
```

### Monitor logs

```bash
npm run monitor:logs
```

### Translate new strings in CI

```bash
npm run ci:translate
```

These scripts demonstrate how `claude` can be scripted. For example:

```bash
tail -f app.log | claude -p "Slack me if you see any anomalies appear in this log stream"
claude -p "If there are new text strings, translate them into French and raise a PR for @lang-fr-team to review"
```
