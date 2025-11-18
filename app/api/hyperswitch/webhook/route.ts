import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const HYPERSWITCH_WEBHOOK_SECRET = process.env.HYPERSWITCH_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('hyperswitch-signature');
    const body = await request.text();

    // Verify webhook signature
    if (HYPERSWITCH_WEBHOOK_SECRET) {
      // Add signature verification logic here
      // This is a placeholder - implement actual verification
    }

    const event = JSON.parse(body);

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data, supabase);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.data, supabase);
        break;
      
      case 'refund.succeeded':
        await handleRefundSucceeded(event.data, supabase);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('HyperSwitch webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(data: any, supabase: any) {
  // Update order status in database
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'paid',
      payment_id: data.payment_id,
      paid_at: new Date().toISOString()
    })
    .eq('payment_intent_id', data.payment_intent_id);

  if (error) {
    console.error('Error updating order:', error);
  }
}

async function handlePaymentFailed(data: any, supabase: any) {
  // Update order status to failed
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'failed',
      failure_reason: data.failure_reason
    })
    .eq('payment_intent_id', data.payment_intent_id);

  if (error) {
    console.error('Error updating order:', error);
  }
}

async function handleRefundSucceeded(data: any, supabase: any) {
  // Handle refund
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: 'refunded',
      refunded_at: new Date().toISOString()
    })
    .eq('payment_id', data.payment_id);

  if (error) {
    console.error('Error updating refund:', error);
  }
}
