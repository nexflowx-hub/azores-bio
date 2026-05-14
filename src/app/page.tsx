'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Leaf, Award, Truck } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';

const CATEGORY_ICONS: Record<string, string> = {
  queijos: '🧀',
  manteigas: '🧈',
  conservas: '🐟',
  vinhos: '🍷',
  licores: '🍶',
  cha: '🍵',
  pastelaria: '🍰',
  compotas: '🍯',
  pimentas: '🌶️',
  bebidas: '🥤',
  charcutaria: '🥩',
  outros: '🎁',
};

interface Category {
  id: number;
  slug: string;
  namePt: string;
  nameEn: string;
  nameFr?: string | null;
  nameDe?: string | null;
  productCount: number;
}

interface ProductData {
  id: number;
  sku?: string | null;
  name: string;
  nameEn?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  stock: number;
  featured: boolean;
  origin?: string | null;
  category?: {
    slug: string;
    nameEn: string;
    namePt: string;
  } | null;
}

export default function Home() {
  const { t, getCategoryName } = useStore();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch featured products
  useEffect(() => {
    fetch('/api/products/featured')
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : data.products ?? []))
      .catch(() => setFeaturedProducts([]));
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=85"
            alt="Açores"
            className="w-full h-full object-cover"
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a1a]/80 via-[#0a1a1a]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a]/40 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container pt-24">
          <div className="max-w-2xl">
            <div
              className={`transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p
                className="text-[#b8962e] text-xs tracking-[0.4em] uppercase mb-5 font-sans"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Açores · Portugal · Atlântico
              </p>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.05] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t('home.hero.title')}
              </h1>
              <p
                className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/store">
                  <button className="flex items-center gap-3 bg-white text-[#1a3a3a] px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-[#f8f5f0] transition-colors group">
                    {t('home.hero.cta')}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="flex items-center gap-3 border border-white/50 text-white px-8 py-4 text-sm font-medium tracking-widest uppercase hover:bg-white/10 transition-colors">
                    Sobre Nós
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/40 animate-pulse" />
        </div>
      </section>

      {/* ─── VALUES ──────────────────────────────────────────────────────── */}
      <section className="bg-[#1a3a3a] py-14">
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
                  <p
                    className="text-white text-sm font-medium"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p
                className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Seleção Especial
              </p>
              <h2
                className="text-3xl md:text-4xl font-medium text-[#1a3a3a]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t('home.featured')}
              </h2>
            </div>
            <Link href="/store">
              <button className="flex items-center gap-2 text-sm font-medium text-[#1a3a3a] hover:text-[#2d5a5a] transition-colors group whitespace-nowrap">
                Ver todos os produtos
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#ede8e0] animate-pulse aspect-[3/4] rounded-none" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#ede8e0]">
        <div className="container">
          <div className="text-center mb-12">
            <p
              className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Explorar
            </p>
            <h2
              className="text-3xl md:text-4xl font-medium text-[#1a3a3a]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t('home.categories')}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories
              .filter((c) => (c.productCount ?? 0) > 0)
              .map((cat) => (
                <Link key={cat.id} href={`/store?cat=${cat.slug}`}>
                  <div className="group flex flex-col items-center gap-3 bg-white p-5 cursor-pointer hover:bg-[#1a3a3a] transition-all duration-300">
                    <span className="text-3xl">{CATEGORY_ICONS[cat.slug] ?? '🌿'}</span>
                    <div className="text-center">
                      <p
                        className="text-sm font-medium text-[#1a3a3a] group-hover:text-white transition-colors"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {getCategoryName(cat)}
                      </p>
                      <p className="text-xs text-[#6b6b6b] group-hover:text-white/60 transition-colors mt-0.5">
                        {cat.productCount} prod.
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / STORY ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p
                className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                A Nossa Missão
              </p>
              <h2
                className="text-3xl md:text-4xl font-medium text-[#1a3a3a] mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t('home.about.title')}
              </h2>
              <p
                className="text-[#6b6b6b] text-lg leading-relaxed mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                {t('home.about.text')}
              </p>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-8">
                Cada produto que encontra na AZORES.BIO foi cuidadosamente selecionado por produtores locais que preservam técnicas ancestrais. Das caves de queijo de São Jorge às vinhas em pedra negra do Pico, levamos até si a essência autêntica das 9 ilhas.
              </p>
              <Link href="/about">
                <button className="flex items-center gap-2 text-sm font-medium text-[#1a3a3a] border-b border-[#1a3a3a] pb-0.5 hover:text-[#b8962e] hover:border-[#b8962e] transition-colors group">
                  Conhecer a nossa história
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=85"
                  alt="Açores - Natureza vulcânica"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Decorative card */}
              <div className="absolute -bottom-6 -left-6 bg-[#1a3a3a] text-white p-6 max-w-[200px]">
                <p
                  className="text-3xl font-medium mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  9
                </p>
                <p className="text-xs text-white/70 tracking-wide uppercase">
                  Ilhas dos Açores
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="Açores"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a3a3a]/75" />
        </div>
        <div className="relative container text-center">
          <p
            className="text-[#b8962e] text-xs tracking-[0.4em] uppercase mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Entrega Internacional
          </p>
          <h2
            className="text-3xl md:text-5xl font-medium text-white mb-6 max-w-2xl mx-auto leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Os Açores chegam à sua mesa, onde quer que esteja
          </h2>
          <p className="text-white/70 mb-10 max-w-lg mx-auto">
            Envios para toda a Europa, EUA, Canadá e mais de 50 países. Embalagem especial para produtos frágeis.
          </p>
          <Link href="/store">
            <button className="bg-white text-[#1a3a3a] px-10 py-4 text-sm font-medium tracking-widest uppercase hover:bg-[#f8f5f0] transition-colors">
              Encomendar Agora
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
