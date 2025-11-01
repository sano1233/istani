import 'server-only';
import Stripe from 'stripe';

/**
 * Stripe Payment Intents for secure payments
 * Uses latest API version as of Nov 2025
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Create a payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; id: string }> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // Amount in cents
    currency,
    automatic_payment_methods: {
      enabled: true, // Enables all available payment methods
    },
    metadata: metadata || {},
    setup_future_usage: 'off_session', // For saving payment methods
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    id: paymentIntent.id,
  };
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Create a customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get customer by ID
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  return stripe.customers.retrieve(customerId);
}

/**
 * List customer's payment methods
 */
export async function listPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  return paymentMethods.data;
}
