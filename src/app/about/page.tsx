'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Award, Globe, Heart, MapPin, ChevronDown } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

// ─── Island data with rich details ──────────────────────────
const ISLAND_DETAIL = [
  {
    name: 'São Miguel',
    accent: 'Ilha Verde',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=85',
    description: 'A maior ilha dos Açores é um mundo de contrastes — lagoas gémeas azuis e verdes, furnas fumegantes onde a terra coze o cozido, e as únicas plantações de chá da Europa.',
    products: 'Chá Gorreana · Queijo São Jorge · Ananás · Licores',
    highlight: 'Sete Cidades, Furnas, Lagoa do Fogo',
  },
  {
    name: 'São Jorge',
    accent: 'Ilha das Fajas',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
    description: 'São Jorge é a ilha do queijo lendário — o Queijo São Jorge DOP, curado nas furnas com mais de 700 anos de tradição. As fajas costeiras criam paisagens dramáticas entre o mar e a montanha.',
    products: 'Queijo São Jorge DOP · Charcutaria · Lacticínios',
    highlight: 'Faja da Caldeira de Santo Cristo, Queijarias tradicionais',
  },
  {
    name: 'Pico',
    accent: 'Montanha Ilha',
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1600&q=85',
    description: 'A montanha do Pico domina a ilha com os seus 2.351m. Nas suas encostas crescem vinhas plantadas em currais de pedra negra — património mundial da UNESCO que produz o Verdelho, um vinho de terroir vulcânico.',
    products: 'Vinho Verdelho · Licores · Queijo · Mel',
    highlight: 'Currais de vinha UNESCO, Montanha do Pico',
  },
  {
    name: 'Terceira',
    accent: 'Ilha Lilás',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85',
    description: 'Angra do Heroísmo, património mundial, é a joia da Terceira. A ilha combina uma rica tradição tauromáquica com uma gastronomia única — a Alcatra, cozinhada lentamente em fornos a lenha.',
    products: 'Alcatra · Queijos · Pastelaria · Vinho',
    highlight: 'Angra do Heroísmo UNESCO, Alcatra terceirense',
  },
  {
    name: 'Faial',
    accent: 'Ilha Azul',
    image: 'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1600&q=85',
    description: 'O Faial é o porto de abrigo do Atlântico — Horta e a sua marina são ponto de encontro de navegadores do mundo inteiro. A Caldeira, com os seus hydrangeas azuis, é uma das imagens mais icónicas dos Açores.',
    products: 'Maracujá · Gin · Conservas · Mel',
    highlight: 'Caldeira do Faial, Marina de Horta, Peter\'s Café Sport',
  },
  {
    name: 'Flores',
    accent: 'Ilha das Flores',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=85',
    description: 'A ilha das Flores é um jardim natural — cachoeiras deslumbrantes, lagoas nos cratères e uma abundância de flores que justifica o nome. É aqui que se produz um dos méis mais puros da Europa.',
    products: 'Mel · Produtos Florestais · Queijo',
    highlight: 'Rocha dos Bordões, Lagoa Negra, Faja Grande',
  },
  {
    name: 'Graciosa',
    accent: 'Ilha Branca',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=85',
    description: 'A Graciosa é a mais serena das ilhas centrais — moinhos brancos, furnas quentes e uma calma que só os Açores oferecem. O seu queijo e vinho são tesouros bem guardados.',
    products: 'Queijo · Vinho · Pastelaria',
    highlight: 'Carapacho, Furna do Enxofre',
  },
  {
    name: 'Santa Maria',
    accent: 'Ilha do Sol',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85',
    description: 'Santa Maria é a ilha mais ensolarada dos Açores e a primeira a ser descoberta. As suas praias de areia dourada contrastam com as restantes ilhas de origem vulcânica. Aqui nasce o Barbeiro, licor de figo da terra.',
    products: 'Mel · Figo da Terra · Barbeiro · Vinho',
    highlight: 'Praia Formosa, Baía de São Lourenço',
  },
  {
    name: 'Corvo',
    accent: 'Ilha Mais Pequena',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=85',
    hero: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=85',
    description: 'Com apenas 17km² e 400 habitantes, o Corvo é a menor ilha dos Açores e uma das comunidades mais isoladas da Europa. A sua Caldeira é um monumento natural e os seus lacticínios são artesanais de excelência.',
    products: 'Lacticínios · Artesanato · Produtos artesanais',
    highlight: 'Caldeira do Corvo, Vila do Corvo',
  },
];

export default function AboutPage() {
  const { t } = useStore();
  const [expandedIsland, setExpandedIsland] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-20 lg:pt-24">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Immersive with island backdrop
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative h-72 sm:h-96 md:h-[500px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=85"
          alt="Açores — Vista aérea das ilhas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a1a]/80 via-[#0a1a1a]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <p className="text-[#b8962e] text-xs tracking-[0.4em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              A Nossa História
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sobre a AZORES.BIO
            </h1>
            <p className="text-white/70 text-lg max-w-lg" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
              Das 9 ilhas do Atlântico para o mundo inteiro
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MISSION — Brand story
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div>
              <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Missão
              </p>
              <h2 className="text-3xl md:text-4xl font-medium text-[#1a3a3a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
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
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=85"
                  alt="Açores — Vinhas vulcânicas"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#b8962e] text-white p-6 max-w-[220px]">
                <p className="text-3xl font-medium mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>100%</p>
                <p className="text-xs text-white/80 tracking-wide uppercase">Produtos Açorianos Autênticos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          9 ISLANDS — Detailed showcase
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#1a3a3a]">
        <div className="container">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Arquipélago
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Conheça as 9 Ilhas
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
              Três grupos de ilhas, nove mundos distintos — cada um com sabores, paisagens e tradições que não existem em mais lado nenhum.
            </p>
          </div>

          <div className="space-y-4">
            {ISLAND_DETAIL.map((island, i) => (
              <div
                key={island.name}
                className="bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/10"
              >
                <button
                  onClick={() => setExpandedIsland(expandedIsland === i ? null : i)}
                  className="w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-6 text-left min-h-[44px]"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-none">
                    <img src={island.image} alt={island.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#b8962e] text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{island.accent}</p>
                    <h3 className="text-white text-lg sm:text-xl font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{island.name}</h3>
                    <p className="text-white/40 text-xs sm:text-sm truncate">{island.products}</p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-white/40 transition-transform flex-shrink-0 ${expandedIsland === i ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedIsland === i && (
                  <div className="px-4 sm:px-6 pb-6 fade-in">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="aspect-video overflow-hidden">
                        <img src={island.image} alt={island.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm leading-relaxed mb-4">{island.description}</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[#b8962e] text-[9px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Produtos</p>
                            <p className="text-white/90 text-sm">{island.products}</p>
                          </div>
                          <div>
                            <p className="text-[#b8962e] text-[9px] tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Destaques</p>
                            <p className="text-white/90 text-sm">{island.highlight}</p>
                          </div>
                        </div>
                        <Link href={`/store?search=${encodeURIComponent(island.name)}`}>
                          <button className="mt-4 flex items-center gap-2 text-xs font-medium text-[#b8962e] tracking-wider uppercase hover:text-white transition-colors group">
                            Ver produtos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          VALUES
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Os Nossos Valores
            </p>
            <h2 className="text-3xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
              O Que Nos Move
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: <Leaf size={24} />, title: 'Naturalidade', desc: 'Produtos 100% naturais, sem aditivos artificiais, respeitando os processos tradicionais de produção.' },
              { icon: <Award size={24} />, title: 'Qualidade DOP', desc: 'Seleção rigorosa de produtores certificados, com foco em denominações de origem protegida.' },
              { icon: <Globe size={24} />, title: 'Alcance Global', desc: 'Entregamos em mais de 50 países, garantindo que os Açores chegam a qualquer canto do mundo.' },
              { icon: <Heart size={24} />, title: 'Comunidade', desc: 'Apoiamos diretamente os produtores locais, contribuindo para a sustentabilidade das ilhas.' },
            ].map((item, i) => (
              <div key={i} className="text-center bg-white p-6 sm:p-8 border border-[#ede8e0]">
                <div className="w-14 h-14 rounded-full border border-[#b8962e]/40 flex items-center justify-center text-[#b8962e] mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="text-[#1a3a3a] font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRODUCER SPOTLIGHT
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#f0ebe3]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=85"
                alt="Produtor açoriano"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Produtores
              </p>
              <h2 className="text-3xl font-medium text-[#1a3a3a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Mãos que Criam Tradição
              </h2>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-4">
                Por trás de cada produto AZORES.BIO está um produtor que dedica a vida a preservar técnicas ancestrais. São queijeiros que curam o São Jorge nas furnas, viticultores que cuidam dos currais de pedra negra no Pico, e mestres chazeiros que colhem à mão nas encostas de São Miguel.
              </p>
              <p className="text-[#6b6b6b] text-sm leading-relaxed">
                Trabalhamos diretamente com mais de 30 produtores locais, garantindo práticas justas e sustentáveis. Quando compra na AZORES.BIO, está a apoiar comunidades inteiras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LEGAL ENTITY
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Entidade Legal</p>
            <h2 className="text-2xl font-medium text-[#1a3a3a] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Azores Meet, Lda</h2>
            <div className="bg-[#f0ebe3] p-6 text-sm text-[#3d3d3d] space-y-2">
              <p><strong>Razão Social:</strong> Azores Meet, Lda</p>
              <p><strong>NIF:</strong> 513553169</p>
              <p><strong>Sede:</strong> Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores, Portugal</p>
              <p><strong>E-mail:</strong> info@azores.bio</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80"
            alt="Açores"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a3a3a]/80" />
        </div>
        <div className="relative container text-center">
          <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pronto para Descobrir os Açores?
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Explore o nosso catálogo de produtos premium e leve um pedaço das ilhas para casa.
          </p>
          <Link href="/store">
            <button className="flex items-center gap-2 bg-white text-[#1a3a3a] px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-[#f8f5f0] transition-colors mx-auto group min-h-[44px]">
              Visitar a Loja <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
