'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Copy, Landmark, Smartphone, Building2, CreditCard, Wallet } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const params = useSearchParams();
  const type = params.get('type') || 'card';
  const tid = params.get('tid') || '';

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-28 pb-20">
      <div className="container max-w-2xl px-4">
        <div className="bg-white p-8 border border-[#ede8e0] text-center">
          {/* Success icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium text-[#1a3a3a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pedido Confirmado!
          </h1>
          <p className="text-[#6b6b6b] mb-8">
            Obrigado pela sua compra. Receberá um e-mail de confirmação em breve.
          </p>

          {/* Order ID */}
          {tid && (
            <div className="bg-[#f8f5f0] p-4 mb-6 text-left">
              <p className="text-sm text-[#6b6b6b]">
                <strong>Número do Pedido:</strong> {tid}
              </p>
            </div>
          )}

          {/* Payment-specific details */}
          {type === 'multibanco' && (
            <div className="bg-purple-50 border border-purple-200 p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Landmark size={20} className="text-purple-600" />
                <h2 className="text-lg font-medium text-purple-800">Referência Multibanco</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Entidade:</strong> {params.get('entity') || '—'}</p>
                <p><strong>Referência:</strong> {params.get('reference') || '—'}</p>
                <p><strong>Valor:</strong> €{params.get('amount') || '—'}</p>
                {params.get('deadline') && <p><strong>Data Limite:</strong> {params.get('deadline')}</p>}
              </div>
              <p className="text-[10px] text-purple-600 mt-3">Pague num terminal Multibanco ou no Home Banking{params.get('deadline') ? ` até ${params.get('deadline')}` : ' no prazo de 48 horas'}.</p>
            </div>
          )}

          {type === 'mbway' && (
            <div className="bg-blue-50 border border-blue-200 p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={20} className="text-blue-600" />
                <h2 className="text-lg font-medium text-blue-800">Confirmação MBWAY</h2>
              </div>
              <p className="text-sm text-blue-700">Verifique a sua app MBWAY e confirme o pagamento. Receberá a confirmação por push notification.</p>
            </div>
          )}

          {type === 'sepa' && (
            <div className="bg-teal-50 border border-teal-200 p-6 mb-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-teal-600" />
                <h2 className="text-lg font-medium text-teal-800">Dados para Transferência SEPA</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>IBAN:</strong> {params.get('iban') || '—'}</p>
                <p><strong>Beneficiário:</strong> {params.get('beneficiary') || '—'}</p>
                <p><strong>Valor:</strong> €{params.get('amount') || '—'}</p>
              </div>
              <p className="text-[10px] text-teal-600 mt-3">O envio será processado após confirmação do pagamento (1-2 dias úteis).</p>
            </div>
          )}

          {(type === 'card' || type === 'crypto') && (
            <div className={type === 'crypto' ? 'bg-emerald-50 border border-emerald-200 p-6 mb-6 text-left' : 'bg-[#f8f5f0] border border-[#ede8e0] p-6 mb-6 text-left'}>
              <div className="flex items-center gap-2 mb-4">
                {type === 'crypto' ? <Wallet size={20} className="text-emerald-600" /> : <CreditCard size={20} className="text-[#1a3a3a]" />}
                <h2 className={type === 'crypto' ? 'text-lg font-medium text-emerald-800' : 'text-lg font-medium text-[#1a3a3a]'}>{type === 'crypto' ? 'Pagamento Web3' : 'Pagamento com Cartão'}</h2>
              </div>
              <p className={type === 'crypto' ? 'text-sm text-emerald-700' : 'text-sm text-[#6b6b6b]'}>O seu pagamento foi processado com sucesso. A encomenda será enviada nos próximos dias úteis.</p>
            </div>
          )}

          {/* Legal info */}
          <div className="p-4 bg-[#ede8e0] text-xs text-[#6b6b6b] mb-6">
            <p className="font-medium text-[#1a3a3a] mb-1">Entidade Emissora</p>
            <p>Azores Meet, Lda | NIF: 513553169</p>
            <p>Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores</p>
          </div>

          <Link href="/">
            <button className="bg-[#1a3a3a] text-white px-8 py-3 font-medium hover:bg-[#2d5a5a] transition-colors">
              Voltar à Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f5f0] pt-28 pb-20">
        <div className="container max-w-2xl px-4 text-center">
          <div className="animate-pulse bg-[#ede8e0] h-96" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
