import type { Metadata } from 'next';
import { Truck, MapPin, Snowflake, Ship, Globe, Mail, Phone, ArrowLeft, Package, RotateCcw, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Envios e Devoluções — AZORES.BIO',
  description: 'Informações sobre envios, prazos de entrega, custos de transporte e política de devoluções da AZORES.BIO.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-24 lg:pt-28 pb-20">
      {/* Header */}
      <div className="bg-[#1a3a3a] py-12 md:py-16">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors mb-6">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            INFORMAÇÕES
          </p>
          <h1 className="text-3xl md:text-4xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Envios e Devoluções
          </h1>
        </div>
      </div>

      <div className="container max-w-4xl mt-12">
        {/* Contact Banner */}
        <div className="bg-[#1a3a3a] p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <p className="text-white text-lg font-medium mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Precisa de ajuda com o seu envio?
            </p>
            <p className="text-white/60 text-sm">Estamos disponíveis para ajudar com encomendas especiais ou dúvidas.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:info@azores.bio" className="flex items-center gap-2 bg-[#b8962e] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#a07e24] transition-colors whitespace-nowrap">
              <Mail size={14} />
              info@azores.bio
            </a>
          </div>
        </div>

        {/* Dynamic pricing banner */}
        <div className="bg-[#b8962e]/10 border border-[#b8962e]/30 p-4 md:p-5 mb-8 flex items-start gap-3">
          <Package size={18} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#1a3a3a]">
            Para encomendas de grande volume, o preço é calculado dinamicamente no carrinho ou sob consulta via{' '}
            <a href="mailto:info@azores.bio" className="text-[#1a3a3a] underline font-medium">info@azores.bio</a>.
          </p>
        </div>

        {/* Shipping Zones */}
        <div className="space-y-8">
          {/* Zone 1: Pickup */}
          <section className="bg-white p-6 md:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1a3a3a] rounded-full flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                1. Levantamento na Loja
              </h2>
            </div>
            <div className="ml-13 space-y-3 pl-[52px]">
              <div className="flex items-center gap-2">
                <span className="text-[#b8962e] font-semibold text-lg">0,00 €</span>
                <span className="text-[#6b6b6b] text-sm">— Grátis</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#6b6b6b]">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#1a3a3a]" />
                <span>Rua da Madalena, 115 — 1100-318 Lisboa</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#6b6b6b]">
                <Clock size={14} className="mt-0.5 flex-shrink-0 text-[#1a3a3a]" />
                <span>Disponível 2 horas após a compra</span>
              </div>
            </div>
          </section>

          {/* Zone 2: PT Continental */}
          <section className="bg-white p-6 md:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1a3a3a] rounded-full flex items-center justify-center">
                <Truck size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                2. Portugal Continental
              </h2>
            </div>
            <div className="ml-13 space-y-4 pl-[52px]">
              {/* Cold Transport */}
              <div className="bg-[#f8f5f0] p-4 border border-[#ede8e0]">
                <div className="flex items-center gap-2 mb-3">
                  <Snowflake size={14} className="text-blue-600" />
                  <p className="text-sm font-medium text-[#1a3a3a]">Transporte Refrigerado</p>
                </div>
                <p className="text-sm text-[#6b6b6b] mb-2">Aplicável quando o carrinho contém artigos que requerem transporte a frio (queijos frescos, manteigas, etc.).</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Até 10 kg</span>
                    <span className="font-medium text-[#1a3a3a]">15,00 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Mais de 10 kg</span>
                    <span className="text-[#b8962e] font-medium text-xs">Preço calculado dinamicamente (+5,00 € por cada 10 kg extra)</span>
                  </div>
                </div>
              </div>

              {/* Normal Transport */}
              <div className="bg-[#f8f5f0] p-4 border border-[#ede8e0]">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={14} className="text-[#1a3a3a]" />
                  <p className="text-sm font-medium text-[#1a3a3a]">Envio Normal</p>
                </div>
                <p className="text-sm text-[#6b6b6b] mb-2">Para encomendas sem artigos refrigerados.</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Até 5 kg</span>
                    <span className="font-medium text-[#1a3a3a]">5,50 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">5,01 — 10 kg</span>
                    <span className="font-medium text-[#1a3a3a]">7,99 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">10,01 — 20 kg</span>
                    <span className="font-medium text-[#1a3a3a]">9,50 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b]">Mais de 20 kg</span>
                    <span className="text-[#b8962e] font-medium text-xs">Preço calculado dinamicamente (+5,00 € por cada 10 kg extra)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6b6b6b]">Prazo de entrega: 24-48h úteis</p>
            </div>
          </section>

          {/* Zone 3: Azores & Madeira */}
          <section className="bg-white p-6 md:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1a3a3a] rounded-full flex items-center justify-center">
                <Ship size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                3. Açores e Madeira
              </h2>
            </div>
            <div className="ml-13 space-y-4 pl-[52px]">
              <div className="bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <Snowflake size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">Produtos refrigerados podem ser enviados por transporte normal (o cliente assume o risco). Para envio refrigerado, contacte{' '}
                  <a href="mailto:info@azores.bio" className="underline font-medium">info@azores.bio</a>.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Até 4,5 kg</span>
                  <span className="font-medium text-[#1a3a3a]">9,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">4,51 — 9 kg</span>
                  <span className="font-medium text-[#1a3a3a]">12,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">9,01 — 18 kg</span>
                  <span className="font-medium text-[#1a3a3a]">20,00 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Mais de 18 kg</span>
                  <span className="text-[#b8962e] font-medium text-xs">Preço calculado dinamicamente (+5,00 € por cada 10 kg extra)</span>
                </div>
              </div>
              <p className="text-xs text-[#6b6b6b]">Prazo de entrega: 3-7 dias úteis</p>
            </div>
          </section>

          {/* Zone 4: EU */}
          <section className="bg-white p-6 md:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1a3a3a] rounded-full flex items-center justify-center">
                <Globe size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                4. União Europeia
              </h2>
            </div>
            <div className="ml-13 space-y-4 pl-[52px]">
              <div className="bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <Snowflake size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">Produtos refrigerados podem ser enviados por transporte normal (o cliente assume o risco). Para envio refrigerado, contacte{' '}
                  <a href="mailto:info@azores.bio" className="underline font-medium">info@azores.bio</a>.
                </p>
              </div>
              <p className="text-sm text-[#6b6b6b]">
                Envios disponíveis para: <strong>Alemanha, França, Espanha, Bélgica, Dinamarca, Países Baixos, Luxemburgo, Polónia, República Checa e Itália.</strong>
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Até 18 kg</span>
                  <span className="font-medium text-[#1a3a3a]">27,50 €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b6b6b]">Mais de 18 kg</span>
                  <span className="text-[#b8962e] font-medium text-xs">Preço calculado dinamicamente (+5,00 € por cada 10 kg extra)</span>
                </div>
              </div>
              <div className="bg-[#f8f5f0] border border-[#ede8e0] p-3">
                <p className="text-sm text-[#6b6b6b]">
                  Para outros países da UE não listados acima, por favor envie um email para <a href="mailto:info@azores.bio" className="text-[#1a3a3a] underline">info@azores.bio</a> para verificar a disponibilidade de envio.
                </p>
              </div>
              <p className="text-xs text-[#6b6b6b]">Prazo de entrega: 5-10 dias úteis</p>
            </div>
          </section>
        </div>

        {/* Returns Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#b8962e] rounded-full flex items-center justify-center">
              <RotateCcw size={18} className="text-white" />
            </div>
            <h2 className="text-2xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Política de Devoluções
            </h2>
          </div>

          <div className="bg-white p-6 md:p-8 border border-[#ede8e0] space-y-6">
            <div className="flex items-start gap-3">
              <Shield size={18} className="text-[#1a3a3a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1a3a3a] mb-1">Direito de Devolução</p>
                <p className="text-sm text-[#6b6b6b]">Dispõe de um prazo de <strong>14 dias</strong> a contar da receção da encomenda para devolver os artigos, conforme o Decreto-Lei n.º 24/2014.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package size={18} className="text-[#1a3a3a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1a3a3a] mb-1">Condições de Devolução</p>
                <p className="text-sm text-[#6b6b6b]">Apenas são aceites devoluções de artigos <strong>selados e não perecíveis</strong>, que se encontrem no estado original e na embalagem intacta. Produtos perecíveis (queijos, charcutaria, etc.) e produtos abertos não são elegíveis para devolução.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck size={18} className="text-[#1a3a3a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1a3a3a] mb-1">Custo de Recolha</p>
                <p className="text-sm text-[#6b6b6b]">O custo de recolha da devolução é de <strong>5,50 €</strong>, deduzido do montante a reembolsar. O reembolso é processado no prazo de 14 dias após a receção do artigo devolvido.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={18} className="text-[#1a3a3a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1a3a3a] mb-1">Como Iniciar uma Devolução</p>
                <p className="text-sm text-[#6b6b6b]">
                  Envie um email para <a href="mailto:info@azores.bio" className="text-[#1a3a3a] underline">info@azores.bio</a> com o número da encomenda e o motivo da devolução. Responderemos com as instruções de envio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Info */}
        <div className="mt-8 p-4 bg-[#ede8e0] text-xs text-[#6b6b6b]">
          <p className="font-medium text-[#1a3a3a] mb-1">Entidade Responsável</p>
          <p>Azores Meet, Lda | NIF: 513553169</p>
          <p>Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores</p>
        </div>
      </div>
    </div>
  );
}
