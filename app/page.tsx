import GalleryGrid from '@/components/GalleryGrid';
import { loadGalleryItems } from '@/lib/images';

export const revalidate = 3600;

export default async function Home() {
  const items = await loadGalleryItems({
    supabaseLimit: 30,
    pexelsCount: 18,
    unsplashCount: 18,
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="mb-6">
        <h1 className="text-4xl font-bold">ISTANI</h1>
        <p>Evidence based fitness inspiration from around the world.</p>
      </section>
      <GalleryGrid items={items} />
    </main>
  );
}
