'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Leaf, Award, Truck, MapPin } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';
import { AtlasProduct, AtlasCategory } from '@/lib/types';
import { fetchFeaturedProducts, fetchCategories } from '@/lib/atlas';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';

// ─── Featured islands for Island Showcase ────────────────────
const FEATURED_ISLANDS = [
  {
    name: 'São Miguel',
    accent: 'Ilha Verde',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=85',
    description: 'A maior ilha dos Açores é um mundo de contrastes — lagoas gémeas azuis e verdes, furnas fumegantes onde a terra coze o cozido, e as únicas plantações de chá da Europa.',
    products: 'Chá Gorreana · Queijos DOP · Ananás · Licores',
  },
  {
    name: 'São Jorge',
    accent: 'Ilha das Fajas',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    description: 'São Jorge é a ilha do queijo lendário — o Queijo São Jorge DOP, curado nas furnas com mais de 700 anos de tradição. As fajas costeiras criam paisagens dramáticas entre o mar e a montanha.',
    products: 'Queijo São Jorge DOP · Charcutaria · Lacticínios',
  },
  {
    name: 'Pico',
    accent: 'Montanha Ilha',
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=85',
    description: 'A montanha do Pico domina a ilha com os seus 2.351m. Nas suas encostas crescem vinhas plantadas em currais de pedra negra — património mundial da UNESCO.',
    products: 'Vinho Verdelho · Licores · Queijo · Mel',
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  queijos: '🧀', manteigas: '🧈', conservas: '🐟', vinhos: '🍷', licores: '🍶',
  cha: '🍵', pastelaria: '🍰', compotas: '🍯', pimentas: '🌶️', bebidas: '🥤',
  charcutaria: '🥩', outros: '🎁',
};

export default function Home() {
  const { t, getCategoryName } = useStore();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<AtlasProduct[]>([]);
  const [categories, setCategories] = useState<AtlasCategory[]>([]);

  // Hero loaded on mount
  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Featured products
  useEffect(() => {
    fetchFeaturedProducts()
      .then((products) => setFeaturedProducts(products))
      .catch(() => setFeaturedProducts([]));
  }, []);

  // Categories
  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]));
  }, []);

  const handleNewsletter = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* Structured Data for SEO */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO — Full-screen immersive with Azores gastronomy
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden">
        {/* Background image — Azores gastronomy plate */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-gastronomy.png"
            alt="Gastronomia Açoriana — Sabores do Atlântico"
            className="w-full h-full object-cover"
            onLoad={() => setHeroLoaded(true)}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a1a]/80 via-[#0a1a1a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a]/60 via-transparent to-[#0a1a1a]/20" />

        {/* Content */}
        <div className="relative container pt-28 sm:pt-24">
          <div className="max-w-2xl">
            <div
              className={`transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p
                className="text-[#b8962e] text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 sm:mb-5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Açores · Portugal · Atlântico
              </p>
              <h1
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.05] mb-4 sm:mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t('home.hero.title')}
              </h1>
              <p
                className="text-white/75 text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-10 max-w-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link href="/store">
                  <button className="flex items-center gap-3 bg-white text-[#1a3a3a] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-medium tracking-widest uppercase hover:bg-[#f8f5f0] transition-colors group min-h-[44px]">
                    {t('home.hero.cta')}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="flex items-center gap-3 border border-white/50 text-white px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-medium tracking-widest uppercase hover:bg-white/10 transition-colors min-h-[44px]">
                    Sobre Nós
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/50">
          <span className="text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. VALUES BAR — Teal trust indicators
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1a3a3a] py-10 sm:py-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Leaf size={20} />, title: '100% Natural', desc: 'Sem aditivos artificiais' },
              { icon: <Award size={20} />, title: 'Certificado DOP', desc: 'Denominação de Origem' },
              { icon: <Truck size={20} />, title: 'Envio Mundial', desc: 'Entrega em 7-14 dias' },
              { icon: <Star size={20} />, title: 'Seleção Premium', desc: 'Curado com rigor' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#b8962e]/40 flex items-center justify-center text-[#b8962e]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{item.title}</p>
                  <p className="text-white/50 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. FEATURED PRODUCTS — Dynamic from Atlas Core
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Seleção Especial</p>
              <h2 className="text-3xl md:text-4xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.featured')}</h2>
            </div>
            <Link href="/store">
              <button className="flex items-center gap-2 text-sm font-medium text-[#1a3a3a] hover:text-[#2d5a5a] transition-colors group whitespace-nowrap min-h-[44px]">
                Ver todos os produtos <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#ede8e0] animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <div key={product.id} className="fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. ISLAND SHOWCASE — 3 featured islands with immersive cards
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 md:py-28 bg-[#1a3a3a]">
        <div className="container">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Arquipélago</p>
            <h2 className="text-3xl md:text-4xl font-medium text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              As 9 Ilhas dos <span className="text-[#b8962e]">Açores</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
              Das furnas fumegantes de São Miguel às vinhas de pedra negra do Pico, cada ilha produz sabores que não existem em mais lado nenhum.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURED_ISLANDS.map((island, i) => (
              <div
                key={island.name}
                className="fade-in group relative overflow-hidden"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {/* Full-bleed image */}
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={island.image}
                    alt={`${island.name} — Açores`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a]/90 via-[#0a1a1a]/30 to-transparent" />
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
                  <p className="text-[#b8962e] text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {island.accent}
                  </p>
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-medium mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {island.name}
                  </h3>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-3 line-clamp-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                    {island.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#b8962e]" />
                    <p className="text-white/60 text-xs sm:text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {island.products}
                    </p>
                  </div>
                </div>
                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#b8962e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            ))}
          </div>

          {/* Link to all islands */}
          <div className="text-center mt-8 sm:mt-10">
            <Link href="/about#islands">
              <button className="flex items-center gap-2 text-sm font-medium text-[#b8962e] tracking-wider uppercase hover:text-white transition-colors group mx-auto min-h-[44px]">
                Explorar todas as ilhas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. CATEGORIES GRID — Dynamic from Atlas Core
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#ede8e0]">
        <div className="container">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Explorar</p>
            <h2 className="text-3xl md:text-4xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('home.categories')}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories
              .filter((c) => (c.productCount ?? 0) > 0)
              .map((cat) => (
                <Link key={cat.slug} href={`/store?cat=${cat.slug}`}>
                  <div className="group flex flex-col items-center gap-3 bg-white p-4 sm:p-5 cursor-pointer hover:bg-[#1a3a3a] transition-all duration-300 min-h-[44px]">
                    <span className="text-2xl sm:text-3xl">{CATEGORY_ICONS[cat.slug] ?? '🌿'}</span>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-[#1a3a3a] group-hover:text-white transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {getCategoryName(cat)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#6b6b6b] group-hover:text-white/60 transition-colors mt-0.5">
                        {cat.productCount} prod.
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. PROVENANCE / STORY — Split layout with Atlantic waves
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
            {/* Image left — Atlantic waves */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="/images/missao-wave.png"
                  alt="Açores — Ondas do Atlântico"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Decorative "9 Ilhas" card overlay — hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#1a3a3a] text-white p-6 max-w-[200px]">
                <p className="text-3xl font-medium mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>9</p>
                <p className="text-xs text-white/70 tracking-wide uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Ilhas dos Açores</p>
              </div>
            </div>

            {/* Text right */}
            <div>
              <p className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>A Nossa Missão</p>
              <h2 className="text-3xl md:text-4xl font-medium text-[#1a3a3a] mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('home.about.title')}
              </h2>
              {/* Gold accent line */}
              <div className="w-16 h-px bg-[#b8962e] mb-6" />
              <p className="text-[#6b6b6b] text-lg leading-relaxed mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                {t('home.about.text')}
              </p>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
                Das caves de queijo de São Jorge às vinhas em pedra negra do Pico, das plantações de chá da Gorreana aos pomos de maracujá do Faial — cada produto conta uma história de tradição, vulcão e Atlântico. Trabalhamos diretamente com produtores locais que preservam técnicas ancestrais há gerações.
              </p>
              <Link href="/about">
                <button className="flex items-center gap-2 text-sm font-medium text-[#1a3a3a] border-b border-[#1a3a3a] pb-0.5 hover:text-[#b8962e] hover:border-[#b8962e] transition-colors group min-h-[44px]">
                  Conhecer a nossa história <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. CTA BANNER — Full-width with gastronomy background
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-gastronomy.png"
            alt="Gastronomia Açoriana — Sabores do Atlântico"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a3a3a]/80" />
        </div>
        <div className="relative container text-center">
          <p className="text-[#b8962e] text-xs tracking-[0.4em] uppercase mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Entrega Internacional</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium text-white mb-4 sm:mb-6 max-w-2xl mx-auto leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Os Açores chegam à sua mesa, onde quer que esteja
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-10 max-w-lg mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
            Envios para toda a Europa, EUA, Canadá e mais de 50 países. Embalagem especial para produtos frágeis.
          </p>
          <Link href="/store">
            <button className="bg-white text-[#1a3a3a] px-8 sm:px-10 py-3.5 sm:py-4 text-xs sm:text-sm font-medium tracking-widest uppercase hover:bg-[#f8f5f0] transition-colors min-h-[44px]">
              Encomendar Agora
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
