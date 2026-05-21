'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { loadStripeOnramp } from '@stripe/crypto';
import { Loader2 } from 'lucide-react';

interface CryptoOnrampFormProps {
  clientSecret: string;
  publishableKey: string;
  onSuccess?: () => void;
}

export default function CryptoOnrampForm({ clientSecret, publishableKey, onSuccess }: CryptoOnrampFormProps) {
  const onrampInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const stripeOnrampPromise = useMemo(() => loadStripeOnramp(publishableKey), [publishableKey]);

  useEffect(() => {
    if (onrampInitialized.current) return;
    onrampInitialized.current = true;

    let cancelled = false;

    async function initOnramp() {
      try {
        const stripeOnramp = await stripeOnrampPromise;
        if (!stripeOnramp || cancelled) return;

        const session = stripeOnramp.createSession({ clientSecret });
        const container = document.getElementById('onramp-container');
        if (container && !cancelled) {
          session.mount('#onramp-container');
        }

        session.addEventListener('onramp_session_updated', (event) => {
          if (event.payload?.session?.status === 'fulfillment_complete') {
            handleSuccess();
          }
        });

        if (!cancelled) setIsLoading(false);
      } catch (err) {
        console.error('[CryptoOnrampForm] Error initializing:', err);
        if (!cancelled) {
          setError('Erro ao carregar o widget Crypto. Tente novamente ou escolha outro método.');
          setIsLoading(false);
        }
      }
    }

    initOnramp();
    return () => { cancelled = true; };
  }, [clientSecret, stripeOnrampPromise, handleSuccess]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700 text-sm font-medium mb-1">Erro no Widget Crypto</p>
        <p className="text-red-600 text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={24} className="animate-spin text-[#1a3a3a]" />
          <p className="text-sm text-[#6b6b6b]">A carregar o widget de pagamento Crypto...</p>
        </div>
      )}
      <div id="onramp-container" className="min-h-[400px] w-full" />
    </div>
  );
}
