import Link from 'next/link';
import { ArrowLeft, Truck, RotateCcw, Clock, Package, ShieldCheck } from 'lucide-react';

export default function EnviosDevolucoesPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-24 pb-20">
      <div className="container max-w-3xl px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#1a3a3a] transition-colors mb-6">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <h1 className="text-3xl font-medium text-[#1a3a3a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Envios e Devoluções
        </h1>
        <p className="text-sm text-[#6b6b6b] mb-10">Azores Meet, Lda | NIF: 513553169</p>

        <div className="space-y-8">
          {/* Envios */}
          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Envios</h2>
            </div>
            <div className="space-y-4 text-sm text-[#3d3d3d] leading-relaxed">
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1a3a3a]">Prazos de Entrega</p>
                  <p>Portugal e Europa: 3–7 dias úteis. Internacional: 7–14 dias úteis.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={16} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1a3a3a]">Embalagem</p>
                  <p>Produtos frágeis (vinhos, queijos) são embalados com proteção reforçada para garantir a integridade durante o transporte.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck size={16} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1a3a3a]">Envio Gratuito</p>
                  <p>Envio gratuito para encomendas superiores a €75 em Portugal e Europa.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Devoluções */}
          <section className="bg-white p-6 sm:p-8 border border-[#ede8e0]">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={20} className="text-[#b8962e]" />
              <h2 className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>Devoluções</h2>
            </div>
            <div className="space-y-4 text-sm text-[#3d3d3d] leading-relaxed">
              <p>Pode devolver qualquer produto no prazo de 14 dias após a receção, desde que se encontre nas condições originais e na embalagem original.</p>
              <p>Produtos perecíveis ou personalizados não são passíveis de devolução, exceto em caso de defeito.</p>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#1a3a3a]">Produto Danificado</p>
                  <p>Se receber um produto danificado, contacte-nos em <a href="mailto:info@azores.bio" className="text-[#b8962e] underline">info@azores.bio</a> com fotografias no prazo de 48 horas. Enviaremos uma substituição ou reembolso.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
