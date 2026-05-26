import Link from 'next/link';
import { ArrowLeft, FileText, Scale, CreditCard, AlertTriangle } from 'lucide-react';

export default function TermosCondicoesPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-24 pb-20">
      <div className="container max-w-3xl px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#1a3a3a] transition-colors mb-6">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <h1 className="text-3xl font-medium text-[#1a3a3a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Termos e Condições
        </h1>
        <p className="text-sm text-[#6b6b6b] mb-10">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Disposições Gerais</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Estes Termos e Condições regulam a utilização do website AZORES.BIO e a compra de produtos através da plataforma.</p>
              <p><strong>Entidade:</strong> Azores Meet, Lda | NIF: 513553169 | Sede: Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores</p>
              <p>A realização de qualquer encomenda implica a aceitação integral destes termos.</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Encomendas</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>As encomendas são processadas após confirmação do pagamento. A Azores Meet, Lda reserva-se o direito de cancelar encomendas em caso de erro de preço, indisponibilidade de stock ou suspeita de fraude.</p>
              <p>Os preços incluem IVA à taxa legal em vigor em Portugal.</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Pagamentos</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Aceitamos os seguintes métodos de pagamento:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cartão de crédito/débito (Visa, Mastercard) via Stripe</li>
                <li>MBWAY</li>
                <li>Referência Multibanco</li>
                <li>Transferência bancária SEPA</li>
                <li>Pagamento Web3 via Stripe Crypto Onramp (5% de desconto)</li>
              </ul>
              <p>Todos os pagamentos são processados de forma segura pela Stripe. A AZORES.BIO não armazena dados bancários.</p>
              <p>Para pagamentos Crypto, é obrigatória a verificação de identidade (KYC L1) conforme a regulamentação europeia (AMLD5). O cliente declara ter mais de 18 anos.</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Direito de Resolução</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Nos termos do Decreto-Lei n.º 24/2014, o consumidor tem direito de resolução do contrato no prazo de 14 dias a contar da receção do bem, sem necessidade de indicar qualquer motivo.</p>
              <p>Exceções: produtos perecíveis, produtos personalizados e produtos selados que foram abertos após a entrega.</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Lei Aplicável</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Estes termos são regidos pela lei portuguesa. Para a resolução de quaisquer litígios, é competente o Centro de Arbitragem de Conflitos de Consumo de Ponta Delgada.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
