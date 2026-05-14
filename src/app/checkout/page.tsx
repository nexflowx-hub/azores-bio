'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, ShoppingBag, CreditCard, MapPin, User, FileText, Loader2 } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4;

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
}

const COUNTRIES = [
  'Portugal', 'Espanha', 'França', 'Alemanha', 'Reino Unido',
  'Itália', 'Países Baixos', 'Bélgica', 'Suíça', 'Áustria',
  'Estados Unidos', 'Canadá', 'Brasil', 'Austrália', 'Outro',
];

const STEP_ICONS = [User, MapPin, CreditCard, FileText];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, t, formatPrice, convertPrice, currency } = useStore();

  const [step, setStep] = useState<Step>(1);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    invoiceNumber: string;
    total: number;
  } | null>(null);

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', vat: '',
    address: '', city: '', postal: '', country: 'Portugal',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = convertPrice(cartTotal);
  const freeShippingThreshold = 75;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 6.5;
  const total = subtotal + shippingCost;

  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim() || form.name.length < 2) newErrors.name = 'Nome obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'E-mail inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.address.trim()) newErrors.address = 'Morada obrigatória';
    if (!form.city.trim()) newErrors.city = 'Cidade obrigatória';
    if (!form.postal.trim()) newErrors.postal = 'Código postal obrigatório';
    if (!form.country.trim()) newErrors.country = 'País obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => (s + 1) as Step);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone || undefined,
          customerVat: form.vat || undefined,
          shippingAddress: form.address,
          shippingCity: form.city,
          shippingPostalCode: form.postal,
          shippingCountry: form.country,
          notes: form.notes || undefined,
          locale: 'pt',
          currency,
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productSku: item.sku || undefined,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setOrderResult({
        orderNumber: data.orderNumber,
        invoiceNumber: data.invoiceNumber,
        total: data.total,
      });
      clearCart();
      setStep(4);
    } catch (err) {
      console.error('Erro no checkout:', err);
      toast.error('Erro ao criar encomenda. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] pt-32 pb-20">
        <div className="container max-w-2xl text-center">
          <ShoppingBag size={64} className="mx-auto text-[#c8b89a] mb-6" />
          <h1 className="text-3xl font-serif text-[#1a3a3a] mb-4">Carrinho vazio</h1>
          <p className="text-[#6b6b6b] mb-8">Adicione produtos ao carrinho para fazer o checkout.</p>
          <Link href="/store">
            <button className="bg-[#1a3a3a] text-white px-8 py-3 font-medium hover:bg-[#2d5a5a] transition-colors">
              Voltar à Loja
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-32 pb-20">
      <div className="container max-w-4xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => {
              const Icon = STEP_ICONS[s - 1];
              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all ${
                      s <= step ? 'bg-[#1a3a3a] text-white' : 'bg-[#ede8e0] text-[#6b6b6b]'
                    }`}
                  >
                    {s < step ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-[#1a3a3a]' : 'bg-[#ede8e0]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-[#1a3a3a] mb-6">Dados Pessoais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Nome</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                      placeholder="João Silva"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-2">E-mail</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                      placeholder="joao@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Telefone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-[#ede8e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]"
                        placeholder="+351 912 345 678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-2">NIF/VAT</label>
                      <input
                        type="text"
                        value={form.vat}
                        onChange={(e) => updateForm('vat', e.target.value)}
                        className="w-full px-4 py-2 border border-[#ede8e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]"
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-[#1a3a3a] mb-6">Endereço de Envio</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Morada</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                      placeholder="Rua Principal, 123"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Cidade</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateForm('city', e.target.value)}
                        className={`w-full px-4 py-2 border ${errors.city ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                        placeholder="Lisboa"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Código Postal</label>
                      <input
                        type="text"
                        value={form.postal}
                        onChange={(e) => updateForm('postal', e.target.value)}
                        className={`w-full px-4 py-2 border ${errors.postal ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                        placeholder="1000-001"
                      />
                      {errors.postal && <p className="text-red-500 text-sm mt-1">{errors.postal}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-2">País</label>
                    <select
                      value={form.country}
                      onChange={(e) => updateForm('country', e.target.value)}
                      className={`w-full px-4 py-2 border ${errors.country ? 'border-red-500' : 'border-[#ede8e0]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]`}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a3a3a] mb-2">Notas (opcional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      className="w-full px-4 py-2 border border-[#ede8e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a3a]"
                      placeholder="Instruções especiais de entrega..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-[#1a3a3a] mb-6">Confirmar Encomenda</h2>
                <div className="space-y-4">
                  <div className="bg-[#f8f5f0] p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-[#1a3a3a] mb-2">Dados Pessoais</h3>
                    <p className="text-sm text-[#6b6b6b]">{form.name} · {form.email}</p>
                    {form.phone && <p className="text-sm text-[#6b6b6b]">Tel: {form.phone}</p>}
                    {form.vat && <p className="text-sm text-[#6b6b6b]">NIF: {form.vat}</p>}
                  </div>
                  <div className="bg-[#f8f5f0] p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-[#1a3a3a] mb-2">Endereço de Envio</h3>
                    <p className="text-sm text-[#6b6b6b]">{form.address}</p>
                    <p className="text-sm text-[#6b6b6b]">{form.postal} {form.city}, {form.country}</p>
                  </div>
                  <div className="bg-[#f8f5f0] p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-[#1a3a3a] mb-2">Artigos</h3>
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm py-1">
                        <span className="text-[#6b6b6b]">{item.name} x{item.quantity}</span>
                        <span className="font-medium text-[#1a3a3a]">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-[#ede8e0] rounded-lg text-xs text-[#6b6b6b]">
                    <p className="font-medium text-[#1a3a3a] mb-2">Entidade Emissora</p>
                    <p>Azores Meet, Lda | NIF: 513553169</p>
                    <p>Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && orderResult && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-serif text-[#1a3a3a] mb-4">Pedido Confirmado!</h2>
                <p className="text-[#6b6b6b] mb-6">Obrigado pela sua compra. Receberá um e-mail de confirmação em breve.</p>
                <div className="bg-[#ede8e0] p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm text-[#6b6b6b]">
                    <strong>Número do Pedido:</strong> {orderResult.orderNumber}
                  </p>
                  <p className="text-sm text-[#6b6b6b] mt-2">
                    <strong>Número da Fatura:</strong> {orderResult.invoiceNumber}
                  </p>
                  <p className="text-sm text-[#6b6b6b] mt-2">
                    <strong>Total:</strong> {formatPrice(orderResult.total)}
                  </p>
                </div>
                <Link href="/">
                  <button className="bg-[#1a3a3a] text-white px-8 py-3 font-medium hover:bg-[#2d5a5a] transition-colors">
                    Voltar à Homepage
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-32">
              <h3 className="text-lg font-serif text-[#1a3a3a] mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-[#ede8e0]">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-[#1a3a3a]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>Envio</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Grátis</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#ede8e0] pt-4 mb-6">
                <div className="flex justify-between font-semibold text-[#1a3a3a]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="space-y-3">
                {step > 1 && step < 4 && (
                  <button
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    className="w-full bg-[#ede8e0] text-[#1a3a3a] py-2 rounded-lg font-medium hover:bg-[#ddd9d0] transition-colors"
                  >
                    Voltar
                  </button>
                )}

                {step < 3 && (
                  <button
                    onClick={handleNext}
                    className="w-full bg-[#1a3a3a] text-white py-2 rounded-lg font-medium hover:bg-[#2d5a5a] transition-colors flex items-center justify-center gap-2"
                  >
                    Próximo <ChevronRight size={16} />
                  </button>
                )}

                {step === 3 && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full bg-[#1a3a3a] text-white py-2 rounded-lg font-medium hover:bg-[#2d5a5a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Confirmar Encomenda ({formatPrice(total)})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
