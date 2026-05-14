'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Award, Globe, Heart } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export default function AboutPage() {
  const { t } = useStore();

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=85"
          alt="Açores"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a3a3a]/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <p className="text-[#b8962e] text-xs tracking-[0.4em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              A Nossa História
            </p>
            <h1 className="text-4xl md:text-5xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sobre a AZORES.BIO
            </h1>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Missão
              </p>
              <h2 className="text-3xl font-medium text-[#1a3a3a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Levar os Açores ao Mundo
              </h2>
              <p className="text-[#6b6b6b] text-lg leading-relaxed mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                A AZORES.BIO nasceu do amor profundo pelas 9 ilhas do arquipélago dos Açores e da vontade de partilhar com o mundo os seus produtos únicos e inigualáveis.
              </p>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-5">
                Somos uma empresa açoriana, sediada em São Jorge, que trabalha diretamente com produtores locais para garantir a autenticidade e qualidade de cada produto. Desde o Queijo São Jorge DOP às vinhas centenárias do Pico, cada item do nosso catálogo conta uma história de tradição e excelência.
              </p>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                A nossa missão é simples: ser a ponte entre os produtores açorianos e os apreciadores de gastronomia em todo o mundo, preservando as tradições e apoiando as comunidades locais.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85"
                alt="Açores - Paisagem"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#1a3a3a]">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Os Nossos Valores
            </p>
            <h2 className="text-3xl font-medium text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              O Que Nos Move
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Leaf size={24} />, title: 'Naturalidade', desc: 'Produtos 100% naturais, sem aditivos artificiais, respeitando os processos tradicionais de produção.' },
              { icon: <Award size={24} />, title: 'Qualidade', desc: 'Seleção rigorosa de produtores certificados, com foco em denominações de origem protegida (DOP).' },
              { icon: <Globe size={24} />, title: 'Alcance Global', desc: 'Entregamos em mais de 50 países, garantindo que os Açores chegam a qualquer canto do mundo.' },
              { icon: <Heart size={24} />, title: 'Comunidade', desc: 'Apoiamos diretamente os produtores locais, contribuindo para a economia das ilhas.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full border border-[#b8962e]/40 flex items-center justify-center text-[#b8962e] mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="text-white font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Entity */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
              Entidade Legal
            </p>
            <h2 className="text-2xl font-medium text-[#1a3a3a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Azores Meet, Lda
            </h2>
            <div className="bg-[#f0ebe3] p-6 text-sm text-[#3d3d3d] space-y-2">
              <p><strong>Razão Social:</strong> Azores Meet, Lda</p>
              <p><strong>NIF:</strong> 513553169</p>
              <p><strong>Sede:</strong> Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal</p>
              <p><strong>E-mail:</strong> info@azores.bio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#ede8e0]">
        <div className="container text-center">
          <h2 className="text-2xl font-medium text-[#1a3a3a] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pronto para Descobrir os Açores?
          </h2>
          <p className="text-[#6b6b6b] mb-8">Explore o nosso catálogo de produtos premium e leve um pedaço das ilhas para casa.</p>
          <Link href="/store">
            <button className="flex items-center gap-2 bg-[#1a3a3a] text-white px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-[#2d5a5a] transition-colors mx-auto group">
              Visitar a Loja
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
