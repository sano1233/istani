# ISTANI

A Next.js 14 application for browsing curated ISTANI fitness imagery sourced from Pexels and Unsplash with Supabase-backed curation.

## Getting started

1. **Database** – run `db/001_create_image_assets.sql` against your Supabase project.
2. **Environment** – copy `.env.example` to `.env.local`, fill in your Supabase and image API keys, and configure the same values in Vercel.
3. **Install** – run `npm ci` to install dependencies.
4. **Develop** – start the local dev server with `npm run dev`.
5. **Optional seeding** – populate curated images locally with `npm run seed:images`.
6. **Protected refresh route** – send a `POST` to `/api/images/refresh` with header `x-admin-token: ADMIN_REFRESH_TOKEN` to refresh curated assets on demand.

## Scripts

- `npm run format` – format the codebase with Prettier.
- `npm run format:check` – verify formatting.
- `npm run lint` – run ESLint with Next.js rules.
- `npm run typecheck` – perform a TypeScript typecheck.
- `npm run build` – create a production build.
- `npm run seed:images` – upsert curated image metadata into Supabase using API data.

## Deployment

Deploy to Vercel. The included GitHub Actions workflows run formatting checks, linting, typechecking, builds, and CodeQL analysis on every push and pull request.
