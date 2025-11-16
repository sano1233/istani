'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);

  return (
    <div className="border rounded-xl border-white/10 bg-white/5 overflow-hidden hover:border-primary/30 transition-colors group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-white/10">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="material-symbols-outlined text-white/20 text-6xl">shopping_bag</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-white mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.short_description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-white/40 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <Button size="sm" onClick={() => addItem(product)} className="gap-2">
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
