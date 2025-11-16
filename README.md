# ISTANI

Static site containing science-based fitness tips, product recommendations, and smart calculators.

## Development

- The site is static HTML served from the repository root.
- Google Search Console verification uses a meta tag on the homepage and a dedicated HTML file.
- Run `npm test` to ensure both verification files contain the required tokens before deployment.

## Deployment

- Netlify: configured via `netlify.toml` to run tests and publish the root directory.
- Vercel: configured via `vercel.json` to run tests and serve static content from the root.
