import { ProductCard } from '@/components/product-card';
import { SUPABASE_FALLBACK_FLAG } from '@/lib/supabase/fallback';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const supabase = await createClient();

  const isFallbackClient = Boolean(
    (supabase as unknown as Record<symbol, boolean>)[SUPABASE_FALLBACK_FLAG],
  );

  const { data: products } = isFallbackClient
    ? { data: [] as Product[] }
    : await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Shop</h1>
          <p className="text-white/60">Premium fitness products for serious athletes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {(!products || products.length === 0) && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-white/20 text-8xl mb-4 block">
              shopping_bag
            </span>
            <h2 className="text-2xl font-bold text-white mb-2">No products available</h2>
            <p className="text-white/60">Check back soon for new products!</p>
          </div>
        )}
      </div>
    </div>
  );
}
