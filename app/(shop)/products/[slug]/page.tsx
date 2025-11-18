'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      const slug = params.slug;
      if (!slug || typeof slug !== 'string') {
        router.push('/products');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();

      if (error || !data) {
        router.push('/products');
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [params.slug, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white/10">
            {product.images && product.images.length > 0 ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="material-symbols-outlined text-white/20 text-9xl">
                  shopping_bag
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-white mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-xl text-white/40 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            <p className="text-white/80 text-lg mb-8">{product.description}</p>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-white font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <span className="material-symbols-outlined">remove</span>
                </Button>
                <span className="text-white text-lg font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  <span className="material-symbols-outlined">add</span>
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button size="lg" onClick={handleAddToCart} className="gap-3">
              <span className="material-symbols-outlined">shopping_cart</span>
              Add to Cart
            </Button>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Product Details</h3>
              <div className="space-y-2 text-white/60">
                <p>
                  Stock:{' '}
                  {product.inventory_quantity > 0 ? (
                    <span className="text-primary">In Stock</span>
                  ) : (
                    <span className="text-red-400">Out of Stock</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
