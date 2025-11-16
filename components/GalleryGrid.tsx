'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { GalleryItem } from '@/lib/images';

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((img) => (
        <figure
          key={`${img.source}-${img.external_id}`}
          className="rounded-lg overflow-hidden border"
        >
          <Image
            src={img.url_regular}
            alt={img.alt ?? 'fitness image'}
            width={img.width ?? 1280}
            height={img.height ?? 720}
            style={{ width: '100%', height: 'auto' }}
            priority={false}
          />
          <figcaption className="p-3 text-sm text-neutral-600 flex items-center justify-between">
            <span>{img.alt ?? 'Fitness'}</span>
            {img.photographer && (
              <Link
                href={img.photographer_url || '#'}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {img.photographer}
              </Link>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
