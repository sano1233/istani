'use client'

import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-white/20 text-9xl mb-4 block">
            shopping_cart
          </span>
          <h1 className="text-3xl font-black text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-white/60 mb-8">
            Add some products to get started!
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl border-white/10 bg-white/5 p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="material-symbols-outlined text-white/20 text-3xl">
                        shopping_bag
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-primary font-bold">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.product_id)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                    >
                      <span className="material-symbols-outlined text-sm">
                        remove
                      </span>
                    </Button>
                    <span className="text-white font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                    >
                      <span className="material-symbols-outlined text-sm">
                        add
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl border-white/10 bg-white/5 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full gap-2">
                  <span className="material-symbols-outlined">
                    lock
                  </span>
                  Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mt-3"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
