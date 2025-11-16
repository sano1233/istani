import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object

      // Update order status
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing' })
        .eq('stripe_payment_intent_id', session.payment_intent)

      break

    case 'payment_intent.succeeded':
      // Handle successful payment
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break
  }

  return NextResponse.json({ received: true })
}
