import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { paymentRateLimit, getClientIP } from '@/lib/security/rate-limit';
import { verifyToken, extractTokenFromCookies } from '@/lib/security/jwt';
import { z } from 'zod';

export const runtime = 'nodejs';

const paymentSchema = z.object({
  amount: z.number().int().positive().max(999999), // Max $9,999.99
  currency: z.string().length(3).default('usd'),
  metadata: z.record(z.string()).optional(),
});

/**
 * Create Stripe payment intent
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const { success } = await paymentRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication required for payments
    const token = extractTokenFromCookies(request.headers.get('cookie'));
    const user = await verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input validation
    const body = await request.json();
    const validation = paymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, currency, metadata } = validation.data;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, {
      ...metadata,
      userId: user.userId,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Payment failed', message: error.message },
      { status: 500 }
    );
  }
}
