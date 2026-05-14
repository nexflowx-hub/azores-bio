import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface PaymentIntentBody {
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentBody = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'A valid amount is required' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment service is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // Create payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(body.amount * 100), // Convert to cents
      currency: body.currency || 'eur',
      metadata: {
        ...body.metadata,
        ...(body.customerEmail ? { customerEmail } : {}),
        ...(body.customerName ? { customerName } : {}),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
