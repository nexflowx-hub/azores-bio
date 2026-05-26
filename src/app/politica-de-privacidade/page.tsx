import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail } from 'lucide-react';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-24 pb-20">
      <div className="container max-w-3xl px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#1a3a3a] transition-colors mb-6">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <h1 className="text-3xl font-medium text-[#1a3a3a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Política de Privacidade
        </h1>
        <p className="text-sm text-[#6b6b6b] mb-10">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Responsável pelo Tratamento</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-2">
              <p><strong>Azores Meet, Lda</strong></p>
              <p>NIF: 513553169</p>
              <p>Sede: Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal</p>
              <p>E-mail: <a href="mailto:info@azores.bio" className="text-[#b8962e] underline">info@azores.bio</a></p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Database size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Dados Recolhidos</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Recolhemos apenas os dados necessários para processar encomendas e melhorar a experiência do utilizador:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nome e e-mail (para comunicação de encomenda)</li>
                <li>Morada de envio (para entrega)</li>
                <li>NIF/VAT (para faturação)</li>
                <li>Dados de pagamento (processados exclusivamente pela Stripe — não armazenados no nosso sistema)</li>
                <li>Data de nascimento (apenas para pagamentos Crypto, conforme requisitos regulatórios KYC)</li>
              </ul>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Segurança</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Todos os pagamentos são processados pela Stripe com encriptação de nível bancário (TLS 1.2+). A AZORES.BIO não armazena dados de cartão de crédito.</p>
              <p>Os dados pessoais são transmitidos de forma segura e tratados em conformidade com o Regulamento Geral de Proteção de Dados (RGPD).</p>
            </div>
          </section>

          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Os Seus Direitos</h2>
            </div>
            <div className="text-sm text-[#3d3d3d] leading-relaxed space-y-3">
              <p>Nos termos do RGPD, tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Acesso aos seus dados pessoais</li>
                <li>Retificação de dados incorretos</li>
                <li>Eliminação dos seus dados</li>
                <li>Portabilidade dos dados</li>
                <li>Oposição ao tratamento</li>
              </ul>
              <p>Para exercer qualquer direito, contacte-nos em <a href="mailto:info@azores.bio" className="text-[#b8962e] underline">info@azores.bio</a>.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
