'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white shadow-sm z-50">
        <div className="container-custom py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="w-8 h-8 text-brand-primary" />
            <span className="text-2xl font-display font-bold text-brand-dark">Istani</span>
          </Link>
        </div>
      </nav>

      {/* Success Message */}
      <div className="container-custom py-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />

          <h1 className="text-4xl font-display font-bold mb-4">Order Successful!</h1>

          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">What's Next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Check Your Email</h3>
                  <p className="text-gray-600 text-sm">
                    You'll receive an order confirmation email with all the details
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Your Order</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your shipment status in your dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Start Training!</h3>
                  <p className="text-gray-600 text-sm">
                    Your products will arrive in 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-gray-600">
            <p>
              Need help? Contact us at{' '}
              <a
                href="mailto:istaniDOTstore@proton.me"
                className="text-brand-primary hover:underline"
              >
                istaniDOTstore@proton.me
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
