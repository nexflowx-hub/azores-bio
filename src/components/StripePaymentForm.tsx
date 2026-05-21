'use client';

import { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard } from 'lucide-react';

interface StripePaymentFormInnerProps {
  onSuccess?: () => void;
}

function StripePaymentFormInner({ onSuccess }: StripePaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?type=card`,
      },
    });

    if (result.error) {
      console.error('[StripePaymentForm] Payment error:', result.error.message);
    } else if (result.paymentIntent?.status === 'succeeded') {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-[#1a3a3a] text-white py-3.5 text-sm font-medium tracking-widest uppercase hover:bg-[#2d5a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <CreditCard size={16} />
        Confirmar Pagamento
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  onSuccess?: () => void;
}

export default function StripePaymentForm({ clientSecret, publishableKey, onSuccess }: StripePaymentFormProps) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentFormInner onSuccess={onSuccess} />
    </Elements>
  );
}
