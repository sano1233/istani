import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const getStripeCustomerId = async (email: string, userId: string) => {
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    return customers.data[0].id
  }

  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      userId: userId,
    },
  })

  return customer.id
}
