import { createClient } from '@supabase/supabase-js';
import { fetchPexelsFitness, fetchUnsplashFitness } from '@/lib/images';
import 'dotenv/config';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const [pexels, unsplash] = await Promise.all([
    fetchPexelsFitness('gym fitness workout strength male training', 60).catch(() => []),
    fetchUnsplashFitness('gym fitness workout strength male training', 60).catch(() => []),
  ]);

  const rows = [...pexels, ...unsplash].map((i) => ({
    source: i.source,
    external_id: i.external_id,
    photographer: i.photographer ?? null,
    photographer_url: i.photographer_url ?? null,
    alt: i.alt ?? null,
    url_small: i.url_small,
    url_regular: i.url_regular,
    url_full: i.url_full ?? null,
    width: i.width ?? null,
    height: i.height ?? null,
  }));

  const { error, data } = await supabase
    .from('image_assets')
    .upsert(rows, { onConflict: 'source,external_id' })
    .select('id');
  if (error) throw error;
  console.log('Upserted', data?.length ?? 0, 'rows');
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
