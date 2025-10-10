export type ExternalImage = {
  source: 'pexels' | 'unsplash';
  external_id: string;
  alt: string | null;
  photographer?: string | null;
  photographer_url?: string | null;
  url_small: string;
  url_regular: string;
  url_full?: string | null;
  width?: number | null;
  height?: number | null;
};

export async function fetchPexelsFitness(
  query = 'fitness workout gym',
  count = 24,
): Promise<ExternalImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(Math.min(count, 80)));
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);
  const data = await res.json();
  return (data.photos || []).map((p: any) => ({
    source: 'pexels' as const,
    external_id: String(p.id),
    alt: p.alt || null,
    photographer: p.photographer || null,
    photographer_url: p.photographer_url || null,
    url_small: p.src.medium,
    url_regular: p.src.large2x || p.src.large,
    url_full: p.src.original,
    width: p.width,
    height: p.height,
  }));
}

export async function fetchUnsplashFitness(
  query = 'fitness workout gym',
  count = 24,
): Promise<ExternalImage[]> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(Math.min(count, 30)));
  url.searchParams.set('orientation', 'landscape');
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Unsplash error ${res.status}`);
  const data = await res.json();
  return (data.results || []).map((p: any) => ({
    source: 'unsplash' as const,
    external_id: p.id,
    alt: p.alt_description || null,
    photographer: p.user?.name || null,
    photographer_url: p.user?.links?.html || null,
    url_small: p.urls.small,
    url_regular: p.urls.regular,
    url_full: p.urls.full,
    width: p.width,
    height: p.height,
  }));
}
