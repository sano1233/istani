import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Create Supabase admin client for webhook
function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: any;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Get line items from session
        const stripe = getStripe();
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Create order in database
        const supabaseAdmin = getSupabaseAdmin();
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: session.metadata?.user_id || null,
            status: 'processing',
            total_amount: session.amount_total! / 100, // Convert from cents
            stripe_payment_intent_id: session.payment_intent as string,
          } as any)
          .select()
          .single();

        if (orderError || !order) {
          console.error('Failed to create order:', orderError);
          break;
        }

        const orderId = (order as any).id;

        // Create order items
        for (const item of lineItems.data) {
          // Extract product details from price data
          const unitAmount = item.price?.unit_amount || 0;

          // Note: In production, you'd want to match products by ID stored in metadata
          await supabaseAdmin.from('order_items').insert({
            order_id: orderId,
            product_id: null, // You'd want to store product_id in metadata
            quantity: item.quantity || 1,
            price_at_time: unitAmount / 100,
          } as any);
        }

        // Order created successfully
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Payment succeeded

        // Update order status to completed
        const supabaseAdmin = getSupabaseAdmin();
        await (supabaseAdmin.from('orders') as any)
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        // Payment failed

        // Update order status to cancelled
        const supabaseAdmin = getSupabaseAdmin();
        await (supabaseAdmin.from('orders') as any)
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        break;
      }

      default:
      // Unhandled event type
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
