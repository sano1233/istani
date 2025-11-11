'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Dumbbell, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
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
            </div>
          </div>
        </nav>

        {/* Empty Cart */}
        <div className="container-custom py-20 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Add some products to get started!
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const total = getTotalPrice()
  const shipping = total > 100 ? 0 : 10
  const tax = total * 0.08 // 8% tax
  const grandTotal = total + shipping + tax

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
            <Link href="/products" className="text-brand-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </nav>

      {/* Cart Content */}
      <div className="container-custom py-12">
        <h1 className="text-4xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-primary">
                          <span className="text-2xl text-white">{item.product.name[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{item.product.category}</p>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-600 hover:text-red-700 transition flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand-dark">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.product.price)} each
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-display font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-brand-primary">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                {total < 100 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
                    Add {formatCurrency(100 - total)} more for free shipping!
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  isLoading={loading}
                >
                  Proceed to Checkout
                </Button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-sm text-gray-600 hover:text-red-600 transition"
                >
                  Clear Cart
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
