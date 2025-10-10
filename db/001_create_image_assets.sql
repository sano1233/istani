create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  source text not null,                 -- "pexels" | "unsplash"
  external_id text not null,
  photographer text,
  photographer_url text,
  alt text,
  url_small text not null,
  url_regular text not null,
  url_full text,
  width int,
  height int,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);
