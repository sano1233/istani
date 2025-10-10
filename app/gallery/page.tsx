import GalleryGrid from '@/components/GalleryGrid';
import { fetchPexelsFitness, fetchUnsplashFitness } from '@/lib/images';
import { supabaseClient } from '@/lib/supabaseClient';

export const revalidate = 3600;

export default async function GalleryPage() {
  const [pexels, unsplash] = await Promise.all([
    fetchPexelsFitness('gym fitness workout strength male training', 24).catch(() => []),
    fetchUnsplashFitness('gym fitness workout strength male training', 24).catch(() => []),
  ]);

  const images = [...pexels, ...unsplash];

  // Optional: read saved curated images from Supabase (public read via anon)
  const { data: saved } = await supabaseClient
    .from('image_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);

  const items = [...(saved || []), ...images];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold mb-6">ISTANI Fitness Gallery</h1>
      <GalleryGrid items={items} />
    </main>
  );
}
