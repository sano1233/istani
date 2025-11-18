import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Get product details from Supabase
    const supabase = await createClient();
    const productIds = items.map((item: { product_id: string }) => item.product_id);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Create line items for Stripe
    const lineItems = items.map((item: { product_id: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.product_id);

      if (!product) {
        throw new Error(`Product not found: ${item.product_id}`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cart`,
      customer_email: user?.email,
      metadata: {
        user_id: user?.id || 'guest',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
