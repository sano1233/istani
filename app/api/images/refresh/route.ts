import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { fetchPexelsFitness, fetchUnsplashFitness } from '@/lib/images';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_REFRESH_TOKEN || token !== process.env.ADMIN_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [pexels, unsplash] = await Promise.all([
    fetchPexelsFitness('gym fitness workout strength male training', 40).catch(() => []),
    fetchUnsplashFitness('gym fitness workout strength male training', 40).catch(() => []),
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

  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('image_assets')
    .upsert(rows, { onConflict: 'source,external_id' })
    .select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ upserted: data?.length ?? 0 });
}
