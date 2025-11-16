import Stripe from 'stripe'

<<<<<<< HEAD
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})
=======
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    // Use the version that matches installed types to avoid TS errors
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeInstance
}
>>>>>>> 076bcbfe (fix(build): make CI deploys pass without secrets and add UI robustness)

export async function createCheckoutSession(
  items: Array<{ product_id: string; quantity: number; price: number }>,
  customerId: string
) {
  const stripe = getStripe()
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product_id,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
  })

  return session
}
