'use client';

import { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Banknote } from 'lucide-react';
import type { PaymentMethod } from '@/lib/types';

interface StripePaymentFormInnerProps {
  onSuccess?: () => void;
  paymentMethod?: PaymentMethod;
  orderId?: string | null;
}

function StripePaymentFormInner({ onSuccess, paymentMethod, orderId }: StripePaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();

  const isBizum = paymentMethod === 'bizum';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Build return_url based on payment method
    // Bizum is a redirect flow — the user is sent to the Bizum app
    // and returns to this URL after authorizing.
    // Card payments may also redirect for 3D Secure.
    const tid = orderId || '';
    const returnUrl = isBizum
      ? `${window.location.origin}/checkout/success?type=bizum&tid=${tid}`
      : `${window.location.origin}/checkout/success?type=card&tid=${tid}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
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
        {isBizum ? (
          <>
            <Banknote size={16} />
            Pagar com Bizum
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Confirmar Pagamento
          </>
        )}
      </button>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  paymentMethod?: PaymentMethod;
  orderId?: string | null;
  onSuccess?: () => void;
}

export default function StripePaymentForm({ clientSecret, publishableKey, paymentMethod, orderId, onSuccess }: StripePaymentFormProps) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentFormInner onSuccess={onSuccess} paymentMethod={paymentMethod} orderId={orderId} />
    </Elements>
  );
}
