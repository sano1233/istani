import GalleryGrid from '@/components/GalleryGrid';
import { loadGalleryItems } from '@/lib/images';

export const revalidate = 3600;

export default async function GalleryPage() {
  const items = await loadGalleryItems({
    supabaseLimit: 60,
    pexelsCount: 24,
    unsplashCount: 24,
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-semibold mb-6">ISTANI Fitness Gallery</h1>
      <GalleryGrid items={items} />
    </main>
  );
}
