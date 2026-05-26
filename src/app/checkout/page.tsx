'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, CreditCard, MapPin, User, Loader2,
  Smartphone, Landmark, Building2,
  Wallet, Zap, ShieldCheck, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { fetchStoreCheckoutConfig, createPaymentIntent, settleStock, createOrder } from '@/lib/atlas';
import { PaymentMethod, AtlasCheckoutResponse, CheckoutConfig } from '@/lib/types';
import dynamic from 'next/dynamic';

const StripePaymentForm = dynamic(() => import('@/components/StripePaymentForm'), { ssr: false });
const CryptoOnrampForm = dynamic(() => import('@/components/CryptoOnrampForm'), { ssr: false });

interface FormData {
  name: string;
  email: string;
  phone: string;
  vat: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  notes: string;
  mbwayPhone: string;
  dob: string;
}

const COUNTRIES = [
  { name: 'Portugal', code: 'PT' },
  { name: 'Espanha', code: 'ES' },
  { name: 'França', code: 'FR' },
  { name: 'Alemanha', code: 'DE' },
  { name: 'Itália', code: 'IT' },
  { name: 'Bélgica', code: 'BE' },
  { name: 'Países Baixos', code: 'NL' },
  { name: 'Luxemburgo', code: 'LU' },
  { name: 'Dinamarca', code: 'DK' },
  { name: 'Polónia', code: 'PL' },
  { name: 'República Checa', code: 'CZ' },
  { name: 'Reino Unido', code: 'GB' },
  { name: 'Estados Unidos', code: 'US' },
  { name: 'Canadá', code: 'CA' },
  { name: 'Suíça', code: 'CH' },
  { name: 'Áustria', code: 'AT' },
];

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  card: <CreditCard size={22} />,
  mbway: <Smartphone size={22} />,
  multibanco: <Landmark size={22} />,
  sepa: <Building2 size={22} />,
  crypto: <Wallet size={22} />,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, formatPrice } = useStore();

  // ─── State ──────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Payment widget state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [showCryptoWidget, setShowCryptoWidget] = useState(false);
  const [cryptoClientSecret, setCryptoClientSecret] = useState<string | null>(null);
  const [cryptoPublishableKey, setCryptoPublishableKey] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', vat: '',
    address: '', city: '', postal: '', country: 'Portugal',
    notes: '', mbwayPhone: '', dob: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Dynamic values from Core Config ───────────────────
  const freeShippingThreshold = checkoutConfig?.freeShippingThreshold ?? 75;
  const baseShippingCost = checkoutConfig?.shippingCost ?? 6.5;
  const cryptoDiscountPct = checkoutConfig?.cryptoDiscountPct ?? 5;
  const sepaIban = checkoutConfig?.iban;
  const sepaBeneficiary = checkoutConfig?.beneficiary;
  const currency = checkoutConfig?.currency ?? 'EUR';

  const shippingCost = cartTotal >= freeShippingThreshold ? 0 : baseShippingCost;
  const total = cartTotal + shippingCost;
  const cryptoDiscount = paymentMethod === 'crypto' ? Number((total * cryptoDiscountPct / 100).toFixed(2)) : 0;
  const finalTotal = paymentMethod === 'crypto' ? Number((total * (1 - cryptoDiscountPct / 100)).toFixed(2)) : total;

  // ─── KYC compliance check for Crypto ───────────────────
  const isKycComplete = paymentMethod !== 'crypto' || (
    form.vat.trim().length >= 5 &&
    form.dob !== '' &&
    (() => {
      const bd = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - bd.getFullYear();
      const m = today.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
      return age >= 18;
    })()
  );

  // ─── Fetch checkout config from Atlas Core ─────────────
  useEffect(() => {
    fetchStoreCheckoutConfig()
      .then((config) => {
        setCheckoutConfig(config);
        if (config.paymentMethods?.length > 0) {
          setPaymentMethod(config.paymentMethods[0].method);
        }
      })
      .catch((err) => {
        console.error('Failed to load checkout config:', err);
        // Fallback: default payment methods with raw API fields
        setCheckoutConfig({
          allowedMethods: ['card', 'mbway', 'multibanco', 'sepa', 'crypto'],
          keys: { stripe_public: '' },
          cryptoWallet: '',
          paymentMethods: [
            { method: 'card', label: 'Cartão de Crédito/Débito', provider: 'STRIPE_PT_002' },
            { method: 'mbway', label: 'MBWAY', requiresPhone: true, provider: 'PROXY_MBWAY' },
            { method: 'multibanco', label: 'Multibanco', provider: 'PROXY_MULTIBANCO' },
            { method: 'sepa', label: 'Transferência SEPA', provider: 'PROXY_SEPA' },
            { method: 'crypto', label: 'Pagamento Web3', description: `-${cryptoDiscountPct}% Desconto`, requiresKYC: true, provider: 'STRIPE_CRYPTO' },
          ],
          stripePublishableKey: '',
          cryptoDiscountPct: 5,
          freeShippingThreshold: 75,
          shippingCost: 6.5,
          currency: 'EUR',
        });
      })
      .finally(() => setConfigLoading(false));
  }, []);

  // ─── Helper: Create order in CRM (non-blocking) ──────
  const submitOrderToCrm = async (tid: string | null) => {
    try {
      await createOrder({
        storeSlug: process.env.NEXT_PUBLIC_STORE_SLUG || 'azores-bio',
        customer: {
          email: form.email,
          fullName: form.name,
          nif: form.vat.trim() || undefined,
          birthDate: form.dob || undefined,
          phone: form.phone || form.mbwayPhone || undefined,
          address: form.address,
          city: form.city,
          postalCode: form.postal,
          country: form.country,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceEur: item.priceEur,
        })),
      });
    } catch (err) {
      console.error('Order creation failed (non-blocking):', err);
    }
  };

  // ─── Form helpers ───────────────────────────────────────
  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAll = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim() || form.name.length < 2) newErrors.name = 'Nome obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    if (!form.address.trim()) newErrors.address = 'Morada obrigatória';
    if (!form.city.trim()) newErrors.city = 'Cidade obrigatória';
    if (!form.postal.trim()) newErrors.postal = 'Código postal obrigatório';
    if (!form.country.trim()) newErrors.country = 'País obrigatório';

    // MBWAY: phone required
    if (paymentMethod === 'mbway') {
      if (!form.mbwayPhone.trim()) {
        newErrors.mbwayPhone = 'Número obrigatório para MBWAY';
      } else if (!/^9\d{8}$/.test(form.mbwayPhone.replace(/\s/g, ''))) {
        newErrors.mbwayPhone = 'Número inválido (9 dígitos)';
      }
    }

    // Crypto: KYC/AML compliance — NIF + birthDate mandatory
    if (paymentMethod === 'crypto') {
      if (!form.phone.trim()) newErrors.phone = 'Telefone obrigatório para Crypto';
      if (!form.vat.trim()) {
        newErrors.vat = 'NIF/SSN obrigatório (KYC)';
      } else if (form.vat.trim().length < 5) {
        newErrors.vat = 'NIF/SSN inválido';
      }
      if (!form.dob) {
        newErrors.dob = 'Data de nascimento obrigatória (KYC)';
      } else {
        const birthDate = new Date(form.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 18) newErrors.dob = 'Tem de ter pelo menos 18 anos (AML)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Checkout submit → Atlas Core V2 ───────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!validateAll()) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!isKycComplete) {
      toast.error('Complete a verificação KYC para prosseguir.');
      return;
    }

    setIsProcessing(true);

    try {
      // Build the Core V2 payload contract
      const result: AtlasCheckoutResponse = await createPaymentIntent({
        store: process.env.NEXT_PUBLIC_STORE_SLUG || 'azores-bio',
        method: paymentMethod,
        amount: finalTotal,
        currency,
        customer: {
          email: form.email,
          fullName: form.name,
          nif: paymentMethod === 'crypto' ? form.vat.trim() : (form.vat.trim() || undefined),
          birthDate: paymentMethod === 'crypto' ? form.dob : undefined,
          phone: form.phone || (paymentMethod === 'mbway' ? form.mbwayPhone.replace(/\s/g, '') : undefined),
          address: form.address,
          city: form.city,
          postalCode: form.postal,
          country: form.country,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceEur: item.priceEur,
        })),
      });

      if (!result || !result.payload) {
        toast.error('Erro ao processar o pagamento. Tente novamente.');
        return;
      }

      setTransactionId(result.payload.orderId || result.transactionId);

      // ── Route based on Core actionType ──────────────────
      // The Core decides routing based on payment_rules DB table
      switch (result.actionType) {
        // Card → Core routed to STRIPE_PT_002
        case 'STRIPE_ELEMENTS': {
          const cs = result.payload.clientSecret;
          const pk = result.payload.publishableKey;
          if (!cs || !pk) {
            toast.error('Erro: dados de pagamento em falta.');
            return;
          }
          setClientSecret(cs);
          setPublishableKey(pk);
          setShowStripeForm(true);
          setTimeout(() => document.getElementById('stripe-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
          break;
        }

        // Crypto → Core routed to STRIPE_CRYPTO / ONRAMP_MONEY
        case 'SHOW_CRYPTO_WIDGET': {
          const cryptoSecret = result.payload.clientSecret;
          if (!cryptoSecret) {
            toast.error('Erro: dados do widget Crypto em falta.');
            return;
          }
          setCryptoClientSecret(cryptoSecret);
          setCryptoPublishableKey(result.payload.publishableKey || null);
          setShowCryptoWidget(true);
          setTimeout(() => document.getElementById('crypto-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
          break;
        }

        // Crypto → External redirect
        case 'REDIRECT_CRYPTO': {
          const cryptoUrl = result.payload.url;
          if (cryptoUrl) {
            clearCart();
            // Create order in CRM (fire-and-forget, non-blocking)
            submitOrderToCrm(result.payload.orderId || result.transactionId);
            window.location.href = cryptoUrl;
          } else {
            toast.error('Erro: URL de redirecionamento não recebido.');
          }
          break;
        }

        // MBWAY → Core routed to Proxy MBWAY (push approval)
        case 'SHOW_MBWAY': {
          clearCart();
          // Create order in CRM (fire-and-forget, non-blocking)
          submitOrderToCrm(result.payload.orderId || result.transactionId);
          const params = new URLSearchParams({
            type: 'mbway',
            tid: result.payload.orderId || result.transactionId,
          });
          router.push(`/checkout/success?${params.toString()}`);
          break;
        }

        // Multibanco → Core routed to Proxy (entity + reference)
        case 'SHOW_MULTIBANCO': {
          clearCart();
          // Create order in CRM (fire-and-forget, non-blocking)
          submitOrderToCrm(result.payload.orderId || result.transactionId);
          const params = new URLSearchParams({
            type: 'multibanco',
            tid: result.payload.orderId || result.transactionId,
            entity: result.payload.entity || '',
            reference: result.payload.reference || '',
            amount: String(result.payload.amount || finalTotal),
            deadline: result.payload.deadline || '',
          });
          router.push(`/checkout/success?${params.toString()}`);
          break;
        }

        // SEPA → Core routed to Proxy SEPA (IBAN + beneficiary)
        case 'SHOW_SEPA': {
          clearCart();
          // Create order in CRM (fire-and-forget, non-blocking)
          submitOrderToCrm(result.payload.orderId || result.transactionId);
          const params = new URLSearchParams({
            type: 'sepa',
            tid: result.payload.orderId || result.transactionId,
            iban: result.payload.iban || sepaIban || '',
            beneficiary: result.payload.beneficiary || sepaBeneficiary || '',
            amount: String(result.payload.amount || finalTotal),
          });
          router.push(`/checkout/success?${params.toString()}`);
          break;
        }

        // Generic redirect
        default: {
          clearCart();
          // Create order in CRM (fire-and-forget, non-blocking)
          submitOrderToCrm(result.payload.orderId || result.transactionId);
          const params = new URLSearchParams({ type: 'card', tid: result.payload.orderId || result.transactionId });
          router.push(`/checkout/success?${params.toString()}`);
        }
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
      toast.error('Erro ao processar o pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── After Stripe/Crypto widget confirms payment ────────
  const handlePaymentSuccess = async () => {
    // Notify Core CRM to settle stock
    if (transactionId) {
      try {
        await settleStock({
          store: process.env.NEXT_PUBLIC_STORE_SLUG || 'azores-bio',
          orderId: transactionId,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceEur: item.priceEur,
          })),
        });
      } catch (err) {
        console.error('Stock settlement failed (non-blocking):', err);
        // Non-blocking: Core will reconcile via webhook
      }

      // Create order in CRM
      await submitOrderToCrm(transactionId);
    }

    clearCart();
    const params = new URLSearchParams({ type: 'card', tid: transactionId || '' });
    router.push(`/checkout/success?${params.toString()}`);
  };

  // ─── Available payment methods (dynamic from Core) ────
  const availableMethods = checkoutConfig?.paymentMethods?.map((pm) => pm.method) || ['card', 'mbway', 'multibanco', 'sepa', 'crypto'];

  // ─── Dynamic labels from Core config ───────────────────
  const getPaymentLabel = (method: PaymentMethod): string => {
    const configMethod = checkoutConfig?.paymentMethods?.find((pm) => pm.method === method);
    if (configMethod?.label) return configMethod.label;
    const defaults: Record<string, string> = {
      card: 'Cartão de Crédito/Débito',
      mbway: 'MBWAY',
      multibanco: 'Multibanco',
      sepa: 'Transferência SEPA',
      crypto: 'Pagamento Web3 (Cartão Bancário)',
    };
    return defaults[method] || method;
  };

  const getPaymentSubtitle = (method: PaymentMethod): string => {
    const configMethod = checkoutConfig?.paymentMethods?.find((pm) => pm.method === method);
    if (configMethod?.description) return configMethod.description;
    const defaults: Record<string, string> = {
      card: 'Visa, Mastercard, etc.',
      mbway: 'Confirme na App',
      multibanco: 'Referência de pagamento',
      sepa: 'Transferência bancária',
      crypto: `Poupe ${cryptoDiscountPct}% — pague com cartão via Stripe. Sem carteira crypto.`,
    };
    return defaults[method] || '';
  };

  // ─── Submit button disabled state ──────────────────────
  const isSubmitDisabled = isProcessing || configLoading || !isKycComplete;

  // ─── Empty cart guard ───────────────────────────────────
  if (cart.length === 0 && !showStripeForm && !showCryptoWidget) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] pt-28 pb-20">
        <div className="container max-w-2xl text-center px-4">
          <ShoppingBag size={64} className="mx-auto text-[#c8b89a] mb-6" />
          <h1 className="text-2xl sm:text-3xl font-medium text-[#1a3a3a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Carrinho vazio</h1>
          <p className="text-[#6b6b6b] mb-8">Adicione produtos ao carrinho para fazer o checkout.</p>
          <Link href="/store">
            <button className="bg-[#1a3a3a] text-white px-8 py-3.5 font-medium hover:bg-[#2d5a5a] transition-colors min-h-[44px]">
              Voltar à Loja
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-24 sm:pt-28 pb-20">
      <div className="container max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/store" className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#1a3a3a] transition-colors mb-4">
            <ArrowRight size={14} className="rotate-180" /> Continuar a comprar
          </Link>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Finalizar Encomenda
          </h1>
          <p className="text-sm text-[#6b6b6b] mt-1">Preencha os dados e escolha o método de pagamento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Main Form Column ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Section 1: Dados Pessoais */}
            <section className="bg-white p-5 sm:p-6 md:p-8 border border-[#ede8e0]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#1a3a3a] text-white flex items-center justify-center text-xs font-bold">1</div>
                <User size={16} className="text-[#1a3a3a]" />
                <h2 className="text-base sm:text-lg font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Dados Pessoais</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">Nome completo *</label>
                    <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.name ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="João Silva" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">E-mail *</label>
                    <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.email ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="joao@example.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">
                      Telefone {paymentMethod === 'crypto' && <span className="text-red-500">*</span>}
                    </label>
                    <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.phone ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="+351 912 345 678" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">
                      NIF/VAT {paymentMethod === 'crypto' && <span className="text-red-500">*</span>}
                    </label>
                    <input type="text" value={form.vat} onChange={(e) => updateForm('vat', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.vat ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="123456789" />
                    {errors.vat && <p className="text-red-500 text-xs mt-1">{errors.vat}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Endereço de Envio */}
            <section className="bg-white p-5 sm:p-6 md:p-8 border border-[#ede8e0]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#1a3a3a] text-white flex items-center justify-center text-xs font-bold">2</div>
                <MapPin size={16} className="text-[#1a3a3a]" />
                <h2 className="text-base sm:text-lg font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Endereço de Envio</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">Morada *</label>
                  <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.address ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="Rua Principal, 123" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">Cidade *</label>
                    <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.city ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="Lisboa" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">Código Postal *</label>
                    <input type="text" value={form.postal} onChange={(e) => updateForm('postal', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.postal ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="1000-001" />
                    {errors.postal && <p className="text-red-500 text-xs mt-1">{errors.postal}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">País *</label>
                    <select value={form.country} onChange={(e) => updateForm('country', e.target.value)} className={`w-full px-3 sm:px-4 py-2.5 border ${errors.country ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`}>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">Notas (opcional)</label>
                  <textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} className="w-full px-3 sm:px-4 py-2.5 border border-[#ede8e0] focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm" placeholder="Instruções especiais de entrega..." rows={2} />
                </div>
              </div>
            </section>

            {/* Section 3: Método de Pagamento (Dynamic from Core DB) */}
            <section className="bg-white p-5 sm:p-6 md:p-8 border border-[#ede8e0]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-[#1a3a3a] text-white flex items-center justify-center text-xs font-bold">3</div>
                <CreditCard size={16} className="text-[#1a3a3a]" />
                <h2 className="text-base sm:text-lg font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Método de Pagamento</h2>
              </div>

              {configLoading ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <Loader2 size={20} className="animate-spin text-[#1a3a3a]" />
                  <span className="text-sm text-[#6b6b6b]">A carregar métodos de pagamento do Core...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableMethods.map((method) => {
                    const isSelected = paymentMethod === method;
                    const isCrypto = method === 'crypto';
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`relative text-left p-4 border-2 transition-all min-h-[44px] ${
                          isSelected
                            ? 'border-[#1a3a3a] bg-[#f8f5f0] shadow-sm'
                            : 'border-[#ede8e0] bg-white hover:border-[#c8b89a] hover:bg-[#f8f5f0]/30'
                        }`}
                      >
                        <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-[#1a3a3a]' : 'border-[#c8b89a]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#1a3a3a]" />}
                        </div>
                        {isCrypto && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-emerald-500 text-white">
                            -{cryptoDiscountPct}% Desconto
                          </span>
                        )}
                        <div className={`mb-2 ${isCrypto ? 'mt-5' : ''} text-[#1a3a3a]`}>
                          {PAYMENT_ICONS[method] || <CreditCard size={22} />}
                        </div>
                        <p className="text-sm font-medium text-[#1a3a3a] pr-5">
                          {getPaymentLabel(method)}
                        </p>
                        <p className="text-[10px] text-[#6b6b6b] mt-0.5">
                          {getPaymentSubtitle(method)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MBWAY Phone */}
              {paymentMethod === 'mbway' && (
                <div className="mt-4 p-4 bg-[#f8f5f0] border border-[#ede8e0]">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#1a3a3a] mb-2">
                    <Smartphone size={14} /> Número de Telemóvel MBWAY *
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-[#ede8e0] text-[#1a3a3a] text-sm font-medium border border-[#ede8e0]">+351</span>
                    <input type="tel" value={form.mbwayPhone} onChange={(e) => updateForm('mbwayPhone', e.target.value)} className={`flex-1 px-4 py-2.5 border ${errors.mbwayPhone ? 'border-red-400' : 'border-[#ede8e0]'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`} placeholder="Ex: 912345678" maxLength={9} />
                  </div>
                  {errors.mbwayPhone && <p className="text-red-500 text-xs mt-1">{errors.mbwayPhone}</p>}
                </div>
              )}

              {/* Crypto KYC/AML Compliance — NIF + birthDate mandatory */}
              {paymentMethod === 'crypto' && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[#1a3a3a]">
                    <ShieldCheck size={16} className="text-green-600" /> Verificação de Identidade (KYC/AML)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Para pagamentos Crypto, a regulamentação europeia (AMLD5) exige a verificação de maioridade (+18) e identificação fiscal. Sem estes dados, o pagamento não pode ser processado.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">
                        NIF / SSN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.vat}
                        onChange={(e) => updateForm('vat', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2.5 border ${errors.vat ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`}
                        placeholder="Ex: 500123456"
                      />
                      {errors.vat && <p className="text-red-500 text-xs mt-1">{errors.vat}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-1.5">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => updateForm('dob', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2.5 border ${errors.dob ? 'border-red-400' : 'border-slate-300'} focus:outline-none focus:border-[#1a3a3a] transition-colors bg-white text-sm`}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                    </div>
                  </div>

                  {/* KYC warning when incomplete */}
                  {!isKycComplete && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-amber-700 font-medium">
                        Preencha o NIF e a Data de Nascimento para desbloquear o pagamento Crypto.
                      </p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-start gap-2">
                      <Zap size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-emerald-700">Poupe {cryptoDiscountPct}% na sua encomenda! Utilize o seu cartão bancário normal para pagar de forma instantânea e segura através da Stripe. Não é necessário ter conta ou carteira crypto.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SEPA info */}
              {paymentMethod === 'sepa' && (
                <div className="mt-4 p-4 bg-teal-50 border border-teal-200">
                  <div className="flex items-start gap-2">
                    <Building2 size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-teal-800">Transferência Bancária SEPA</p>
                      <p className="text-[10px] text-teal-700 mt-1">Após finalizar, receberá os dados bancários para efetuar a transferência. O envio será processado após confirmação do pagamento (1-2 dias úteis).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multibanco info */}
              {paymentMethod === 'multibanco' && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-2">
                    <Landmark size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Pagamento por Referência Multibanco</p>
                      <p className="text-[10px] text-purple-700 mt-1">Após finalizar, receberá a Entidade e Referência para efetuar o pagamento num terminal Multibanco ou no Home Banking. O prazo de pagamento é de 48 horas.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ── Stripe Elements (Core routed to STRIPE_PT_002) ── */}
            {showStripeForm && clientSecret && publishableKey && (
              <section id="stripe-section" className="bg-white p-5 sm:p-6 md:p-8 border-2 border-[#1a3a3a]">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck size={16} className="text-[#1a3a3a]" />
                  <h2 className="text-base sm:text-lg font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Pagamento Seguro</h2>
                </div>
                <p className="text-sm text-[#6b6b6b] mb-6">Insira os seus dados de cartão para concluir a encomenda.</p>
                <StripePaymentForm clientSecret={clientSecret} publishableKey={publishableKey} onSuccess={handlePaymentSuccess} />
              </section>
            )}

            {/* ── Crypto Onramp Widget (Core routed to STRIPE_CRYPTO / ONRAMP_MONEY) ── */}
            {showCryptoWidget && cryptoClientSecret && cryptoPublishableKey && (
              <section id="crypto-section" className="bg-white p-5 sm:p-6 md:p-8 border-2 border-emerald-500">
                <div className="flex items-center gap-2 mb-5">
                  <Wallet size={16} className="text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Pagamento Web3</h2>
                  <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-emerald-500 text-white">-{cryptoDiscountPct}% Desconto</span>
                </div>
                <p className="text-sm text-[#6b6b6b] mb-6">Complete o pagamento no widget abaixo. Utilize o seu cartão bancário normal — o processo é automático e seguro.</p>
                <CryptoOnrampForm clientSecret={cryptoClientSecret} publishableKey={cryptoPublishableKey} onSuccess={handlePaymentSuccess} />
                <div className="flex items-center justify-center gap-2 text-xs text-[#6b6b6b] mt-4 pt-4 border-t border-[#ede8e0]">
                  <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Transação processada com segurança de nível bancário pela Stripe Onramp. O seu pagamento em Euros é convertido automaticamente.</span>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar: Order Summary ────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white p-5 sm:p-6 border border-[#ede8e0] lg:sticky lg:top-28 sticky top-20 z-10">
              <h3 className="text-base sm:text-lg font-medium text-[#1a3a3a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Resumo da Encomenda</h3>

              {/* Cart items */}
              <div className="space-y-2.5 mb-4 pb-4 border-b border-[#ede8e0] max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm gap-2">
                    <span className="text-[#6b6b6b] line-clamp-1 flex-1">{item.name} ×{item.quantity}</span>
                    <span className="font-medium text-[#1a3a3a] whitespace-nowrap">{formatPrice(item.priceEur * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Envio</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Grátis</span> : formatPrice(shippingCost)}</span>
                </div>
              </div>

              {/* Crypto discount */}
              {paymentMethod === 'crypto' && cryptoDiscount > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                    <Zap size={12} /> Desconto Web3 ({cryptoDiscountPct}%)
                  </span>
                  <span className="text-emerald-600 font-medium">-{formatPrice(cryptoDiscount)}</span>
                </div>
              )}

              <div className="border-t border-[#ede8e0] pt-3 mb-5">
                <div className="flex justify-between font-semibold text-[#1a3a3a]">
                  <span>Total</span>
                  {paymentMethod === 'crypto' && cryptoDiscount > 0 ? (
                    <div className="text-right">
                      <span className="line-through text-slate-400 text-sm mr-2">{formatPrice(total)}</span>
                      <span className="text-lg text-emerald-600">{formatPrice(finalTotal)}</span>
                    </div>
                  ) : (
                    <span className="text-lg">{formatPrice(total)}</span>
                  )}
                </div>
              </div>

              {/* Free shipping progress */}
              {cartTotal < freeShippingThreshold && (
                <div className="mb-4 p-3 bg-[#f8f5f0] border border-[#ede8e0]">
                  <div className="flex justify-between text-[10px] text-[#6b6b6b] mb-1.5">
                    <span>Envio gratuito a partir de {formatPrice(freeShippingThreshold)}</span>
                    <span className="font-medium text-[#1a3a3a]">faltam {formatPrice(freeShippingThreshold - cartTotal)}</span>
                  </div>
                  <div className="h-1 bg-[#ede8e0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a3a3a] rounded-full transition-all duration-500" style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Submit button — blocked if KYC incomplete for crypto */}
              {!showStripeForm && !showCryptoWidget && (
                <>
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitDisabled}
                    className="w-full bg-[#1a3a3a] text-white py-3.5 font-medium hover:bg-[#2d5a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm min-h-[44px]"
                  >
                    {isProcessing ? (
                      <><Loader2 size={14} className="animate-spin" /> A processar...</>
                    ) : !isKycComplete ? (
                      <><AlertTriangle size={14} /> Complete o KYC para pagar</>
                    ) : (
                      <><CreditCard size={14} /> Finalizar Encomenda — {paymentMethod === 'crypto' ? <><span className="line-through text-white/50 mr-1">{formatPrice(total)}</span>{formatPrice(finalTotal)}</> : formatPrice(finalTotal)}</>
                    )}
                  </button>
                  {!isKycComplete && paymentMethod === 'crypto' && (
                    <p className="text-[10px] text-amber-600 text-center mt-2">Preencha NIF e Data de Nascimento acima</p>
                  )}
                </>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6b6b6b] mt-3">
                <ShieldCheck size={12} /> Pagamento seguro e encriptado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
