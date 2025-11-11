import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { Dumbbell, ShoppingCart } from 'lucide-react'

export const metadata = {
  title: 'Shop - Istani Fitness',
  description: 'Premium fitness supplements, equipment, and apparel',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  const categories = [...new Set(products?.map(p => p.category) || [])]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white shadow-sm z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-brand-primary" />
              <span className="text-2xl font-display font-bold text-brand-dark">Istani</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-brand-primary transition">
                Dashboard
              </Link>
              <Link href="/coaching" className="text-gray-700 hover:text-brand-primary transition">
                Coaching
              </Link>
              <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-brand-primary transition">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-display font-bold mb-4">
            Premium Fitness Shop
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Science-backed supplements, professional equipment, and high-performance apparel
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container-custom py-8">
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-2 bg-brand-primary text-white rounded-full font-medium hover:bg-brand-primary/90 transition">
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-100 transition border border-gray-200"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container-custom py-8 pb-20">
        {!products || products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-display font-bold mb-2">No Products Available</h2>
            <p className="text-gray-600 mb-6">
              Check back soon for our premium fitness products!
            </p>
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-display font-bold mb-4">Istani Fitness</h4>
              <p className="text-gray-400">
                Premium fitness products and coaching
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Support</h4>
              <p className="text-gray-400">istaniDOTstore@proton.me</p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">Connect</h4>
              <a
                href="https://buymeacoffee.com/istanifitn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg transition"
              >
                ☕ Buy Me a Coffee
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Istani Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
