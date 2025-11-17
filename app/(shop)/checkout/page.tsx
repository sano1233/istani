'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Here you would integrate with Stripe
    // For now, just simulate a delay
    setTimeout(() => {
      alert('Checkout functionality will be integrated with Stripe');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" required />
                  <Input label="Last Name" required />
                  <Input label="Email" type="email" className="md:col-span-2" required />
                  <Input label="Address" className="md:col-span-2" required />
                  <Input label="City" required />
                  <Input label="Postal Code" required />
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>
                <p className="text-white/60 mb-4">Secure payment processing powered by Stripe</p>
                <div className="p-8 border border-white/10 rounded-lg bg-white/5 text-center">
                  <span className="material-symbols-outlined text-white/20 text-6xl mb-4 block">
                    lock
                  </span>
                  <p className="text-white/60">
                    Stripe integration will be configured during deployment
                  </p>
                </div>
              </Card>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                <span className="material-symbols-outlined">lock</span>
                {loading ? 'Processing...' : `Pay ${formatPrice(getTotalPrice())}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
