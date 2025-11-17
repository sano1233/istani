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

  interface StripeEvent {
    type: string;
    data: {
      object: {
        id?: string;
        metadata?: { user_id?: string };
        amount_total?: number;
        payment_intent?: string;
      };
    };
  }

  let event: StripeEvent;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!) as StripeEvent;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { id?: string; metadata?: { user_id?: string }; amount_total?: number; payment_intent?: string };

        if (!session.id) {
          // eslint-disable-next-line no-console
          console.error('Session ID missing');
          break;
        }

        // Get line items from session
        const stripe = getStripe();
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Create order in database
        const supabaseAdmin = getSupabaseAdmin();
        
        // Type assertion needed due to strict Supabase types
        const { data: order, error: orderError } = await (supabaseAdmin
          .from('orders') as unknown as {
            insert: (values: Record<string, unknown>) => {
              select: () => { single: () => Promise<{ data: { id: string } | null; error: unknown }> };
            };
          })
          .insert({
            user_id: session.metadata?.user_id || null,
            status: 'processing',
            total_amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
            stripe_payment_intent_id: session.payment_intent || null,
          })
          .select()
          .single();

        if (orderError || !order) {
          // eslint-disable-next-line no-console
          console.error('Failed to create order:', orderError);
          break;
        }

        const orderId = (order as { id: string }).id;

        // Create order items
        for (const item of lineItems.data) {
          // Extract product details from price data
          const unitAmount = item.price?.unit_amount || 0;

          // Note: In production, you'd want to match products by ID stored in metadata
          // Type assertion needed due to strict Supabase types
          await (supabaseAdmin.from('order_items') as unknown as {
            insert: (values: Record<string, unknown>) => Promise<unknown>;
          }).insert({
            order_id: orderId,
            product_id: null, // You'd want to store product_id in metadata
            quantity: item.quantity || 1,
            price_at_time: unitAmount / 100,
          });
        }

        // Log order creation (console.log is acceptable for webhook logging)
        // eslint-disable-next-line no-console
        console.log('Order created successfully:', orderId);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // eslint-disable-next-line no-console
        console.log('Payment succeeded:', paymentIntent.id);

        // Update order status to completed
        const supabaseAdmin = getSupabaseAdmin();
        const paymentIntentObj = paymentIntent as { id: string };
        // Type assertion needed due to strict Supabase types
        await (supabaseAdmin.from('orders') as unknown as {
          update: (values: Record<string, unknown>) => {
            eq: (column: string, value: string) => Promise<unknown>;
          };
        })
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', paymentIntentObj.id);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        // eslint-disable-next-line no-console
        console.log('Payment failed:', paymentIntent.id);

        // Update order status to cancelled
        const supabaseAdmin = getSupabaseAdmin();
        const paymentIntentObj = paymentIntent as { id: string };
        // Type assertion needed due to strict Supabase types
        await (supabaseAdmin.from('orders') as unknown as {
          update: (values: Record<string, unknown>) => {
            eq: (column: string, value: string) => Promise<unknown>;
          };
        })
          .update({ status: 'cancelled' })
          .eq('stripe_payment_intent_id', paymentIntentObj.id);

        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Webhook handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
