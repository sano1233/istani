import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Guard against missing env at build or misconfigured environments
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: any

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
