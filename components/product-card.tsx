'use client'

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart-store'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product)
  }

  return (
    <Card className="group overflow-hidden">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-primary">
            <span className="text-4xl text-white">{product.name[0]}</span>
          </div>
        )}
        {product.featured && (
          <div className="absolute top-4 right-4 bg-brand-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="mb-2">
          <span className="text-sm text-brand-primary font-medium uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        <h3 className="text-xl font-display font-bold mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-brand-dark">
            {formatCurrency(product.price)}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            size="sm"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>

        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <p className="text-amber-600 text-sm mt-2">
            Only {product.stock_quantity} left in stock!
          </p>
        )}
      </CardContent>
    </Card>
  )
}
