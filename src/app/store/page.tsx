'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';

const SORT_OPTIONS = [
  { value: 'featured', labelKey: 'store.sort.featured' },
  { value: 'price_asc', labelKey: 'store.sort.price_asc' },
  { value: 'price_desc', labelKey: 'store.sort.price_desc' },
  { value: 'name', labelKey: 'store.sort.name' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

interface CategoryData {
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
  nameFr?: string | null;
  nameDe?: string | null;
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
    nameFr?: string | null;
    nameDe?: string | null;
  } | null;
}

export default function StorePage() {
  const searchParams = useSearchParams();
  const { t, getCategoryName } = useStore();

  const initialCat = searchParams.get('cat') || 'all';
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [sort, setSort] = useState<SortValue>('featured');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sync category with URL — use callback to avoid cascading renders
  const catFromUrl = searchParams.get('cat');
  const effectiveCat = catFromUrl || 'all';

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Derive effective category
  const effectiveCategory = catFromUrl && catFromUrl !== 'all' ? catFromUrl : (selectedCat === 'all' ? 'all' : selectedCat);

  // Fetch products
  useEffect(() => {
    const params = new URLSearchParams();
    if (effectiveCategory && effectiveCategory !== 'all') params.set('categorySlug', effectiveCategory);
    if (search) params.set('search', search);
    params.set('sort', sort);
    params.set('limit', '48');

    let cancelled = false;
    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [effectiveCategory, search, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
  };

  const activeCatLabel =
    effectiveCategory === 'all'
      ? t('store.all')
      : categories.find((c) => c.slug === effectiveCategory)
      ? getCategoryName(categories.find((c) => c.slug === effectiveCategory)!)
      : effectiveCategory;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-20 lg:pt-24">
      {/* Store header */}
      <div className="bg-[#1a3a3a] py-12 md:py-16">
        <div className="container">
          <p
            className="text-[#b8962e] text-xs tracking-[0.35em] uppercase mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            AZORES.BIO
          </p>
          <h1
            className="text-3xl md:text-4xl font-medium text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {effectiveCategory === 'all' ? t('store.title') : activeCatLabel}
          </h1>
          {total > 0 && (
            <p className="text-white/50 text-sm mt-2">
              {total} {t('store.results')}
            </p>
          )}
        </div>
      </div>

      <div className="container py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b6b]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#ede8e0] text-sm text-[#1a3a3a] placeholder-[#6b6b6b] focus:outline-none focus:border-[#1a3a3a] transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#1a3a3a]"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 bg-white border border-[#ede8e0] px-4 py-3 text-sm text-[#1a3a3a] hover:border-[#1a3a3a] transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal size={15} />
              {t('store.sort')}: {t(SORT_OPTIONS.find((s) => s.value === sort)?.labelKey ?? 'store.sort.featured')}
              <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#ede8e0] shadow-lg z-20 min-w-[200px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f8f5f0] transition-colors ${
                      sort === opt.value ? 'text-[#1a3a3a] font-medium' : 'text-[#6b6b6b]'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Categories sidebar — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <h3
              className="text-xs font-medium tracking-[0.2em] uppercase text-[#6b6b6b] mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {t('store.filter')}
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCat('all')}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    effectiveCategory === 'all'
                      ? 'bg-[#1a3a3a] text-white font-medium'
                      : 'text-[#3d3d3d] hover:bg-[#ede8e0]'
                  }`}
                >
                  {t('store.all')}
                  <span className="float-right text-xs opacity-60">
                    {categories.reduce((s, c) => s + (c.productCount ?? 0), 0)}
                  </span>
                </button>
              </li>
              {categories
                .filter((c) => (c.productCount ?? 0) > 0)
                .map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCat(cat.slug)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                        effectiveCategory === cat.slug
                          ? 'bg-[#1a3a3a] text-white font-medium'
                          : 'text-[#3d3d3d] hover:bg-[#ede8e0]'
                      }`}
                    >
                      {getCategoryName(cat)}
                      <span className="float-right text-xs opacity-60">{cat.productCount}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 text-sm text-[#1a3a3a] border border-[#ede8e0] px-4 py-2.5 bg-white"
              >
                <SlidersHorizontal size={14} />
                {t('store.filter')}: {activeCatLabel}
                <ChevronDown size={12} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
              {filtersOpen && (
                <div className="mt-2 bg-white border border-[#ede8e0] p-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedCat('all');
                      setFiltersOpen(false);
                    }}
                    className={`text-sm px-3 py-2 text-left ${
                      effectiveCategory === 'all' ? 'bg-[#1a3a3a] text-white' : 'bg-[#f8f5f0] text-[#3d3d3d]'
                    }`}
                  >
                    {t('store.all')}
                  </button>
                  {categories
                    .filter((c) => (c.productCount ?? 0) > 0)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCat(cat.slug);
                          setFiltersOpen(false);
                        }}
                        className={`text-sm px-3 py-2 text-left ${
                          effectiveCategory === cat.slug ? 'bg-[#1a3a3a] text-white' : 'bg-[#f8f5f0] text-[#3d3d3d]'
                        }`}
                      >
                        {getCategoryName(cat)}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-[#ede8e0] animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-4xl mb-4">🌿</p>
                <p
                  className="text-xl font-medium text-[#1a3a3a] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {t('store.empty')}
                </p>
                <button
                  onClick={() => {
                    setSelectedCat('all');
                    clearSearch();
                  }}
                  className="mt-4 text-sm text-[#6b6b6b] underline underline-offset-4 hover:text-[#1a3a3a]"
                >
                  Ver todos os produtos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="fade-in"
                    style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns */}
      {sortOpen && <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />}
    </div>
  );
}
