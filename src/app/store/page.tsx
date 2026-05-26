'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';
import { AtlasProduct, AtlasCategory } from '@/lib/types';
import { fetchBootstrap } from '@/lib/atlas';

const SORT_OPTIONS = [
  { value: 'featured', labelKey: 'store.sort.featured' },
  { value: 'price_asc', labelKey: 'store.sort.price_asc' },
  { value: 'price_desc', labelKey: 'store.sort.price_desc' },
  { value: 'name', labelKey: 'store.sort.name' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

const PRODUCTS_PER_PAGE = 24;

function StorePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, getCategoryName } = useStore();

  // Category is always driven by URL param ?cat=
  const activeCategory = searchParams.get('cat') || 'all';
  const [sort, setSort] = useState<SortValue>('featured');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<AtlasProduct[]>([]);
  const [categories, setCategories] = useState<AtlasCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Change category → push to URL
  const selectCategory = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('cat');
    } else {
      params.set('cat', slug);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setVisibleCount(PRODUCTS_PER_PAGE); // Reset pagination on category change
  }, [searchParams, router, pathname]);

  // Fetch bootstrap — single call gets all products + categories
  useEffect(() => {
    fetchBootstrap()
      .then((data) => {
        setAllProducts(data.products);
        setCategories(data.categories);
        setIsLoading(false);
      })
      .catch(() => {
        setAllProducts([]);
        setCategories([]);
        setIsLoading(false);
      });
  }, []);

  // Client-side filtering + sorting (all derived from allProducts)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.origin && p.origin.toLowerCase().includes(q)),
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.priceEur - b.priceEur);
        break;
      case 'price_desc':
        result.sort((a, b) => b.priceEur - a.priceEur);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Keep original API order
        break;
    }

    return result;
  }, [allProducts, activeCategory, searchQuery, sort]);

  // Paginated slice
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const hasMore = visibleCount < filteredProducts.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchInput('');
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
  };

  const activeCatLabel =
    activeCategory === 'all'
      ? t('store.all')
      : categories.find((c) => c.slug === activeCategory)
        ? getCategoryName(categories.find((c) => c.slug === activeCategory)!)
        : activeCategory;

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
            {activeCategory === 'all' ? t('store.title') : activeCatLabel}
          </h1>
          {filteredProducts.length > 0 && (
            <p className="text-white/50 text-sm mt-2">
              {filteredProducts.length} {t('store.results')}
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
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#ede8e0] text-[#1a3a3a] placeholder-[#6b6b6b] focus:outline-none focus:border-[#1a3a3a] transition-colors min-h-[44px]"
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
              className="flex items-center gap-2 bg-white border border-[#ede8e0] px-4 py-3 text-sm text-[#1a3a3a] hover:border-[#1a3a3a] transition-colors whitespace-nowrap min-h-[44px]"
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
                  onClick={() => selectCategory('all')}
                  className={`w-full text-left px-3 py-3 text-sm transition-colors min-h-[44px] ${
                    activeCategory === 'all'
                      ? 'bg-[#1a3a3a] text-white font-medium'
                      : 'text-[#3d3d3d] hover:bg-[#ede8e0]'
                  }`}
                >
                  {t('store.all')}
                  <span className="float-right text-xs opacity-60">
                    {allProducts.length}
                  </span>
                </button>
              </li>
              {categories
                .filter((c) => (c.productCount ?? 0) > 0)
                .map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => selectCategory(cat.slug)}
                      className={`w-full text-left px-3 py-3 text-sm transition-colors min-h-[44px] ${
                        activeCategory === cat.slug
                          ? 'bg-[#1a3a3a] text-white font-medium'
                          : 'text-[#3d3d3d] hover:bg-[#ede8e0]'
                      }`}
                    >
                      {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
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
                className="flex items-center gap-2 text-sm text-[#1a3a3a] border border-[#ede8e0] px-4 py-2.5 bg-white min-h-[44px]"
              >
                <SlidersHorizontal size={14} />
                {t('store.filter')}: {activeCatLabel}
                <ChevronDown size={12} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
              {filtersOpen && (
                <div className="mt-2 bg-white border border-[#ede8e0] p-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      selectCategory('all');
                      setFiltersOpen(false);
                    }}
                    className={`text-sm px-3 py-2.5 text-left min-h-[44px] ${
                      activeCategory === 'all' ? 'bg-[#1a3a3a] text-white' : 'bg-[#f8f5f0] text-[#3d3d3d]'
                    }`}
                  >
                    {t('store.all')}
                  </button>
                  {categories
                    .filter((c) => (c.productCount ?? 0) > 0)
                    .map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          selectCategory(cat.slug);
                          setFiltersOpen(false);
                        }}
                        className={`text-sm px-3 py-2.5 text-left min-h-[44px] ${
                          activeCategory === cat.slug ? 'bg-[#1a3a3a] text-white' : 'bg-[#f8f5f0] text-[#3d3d3d]'
                        }`}
                      >
                        {cat.icon && <span className="mr-1">{cat.icon}</span>}
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
            ) : filteredProducts.length === 0 ? (
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
                    selectCategory('all');
                    clearSearch();
                  }}
                  className="mt-4 text-sm text-[#6b6b6b] underline underline-offset-4 hover:text-[#1a3a3a]"
                >
                  Ver todos os produtos
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {visibleProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="fade-in"
                      style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Load More button */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      className="flex items-center gap-2 bg-[#1a3a3a] text-white px-8 py-3.5 text-xs font-medium tracking-widest uppercase hover:bg-[#2d5a5a] transition-colors min-h-[44px]"
                    >
                      Ver mais ({filteredProducts.length - visibleCount} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns */}
      {sortOpen && <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />}
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f5f0] pt-20 lg:pt-24">
        <div className="bg-[#1a3a3a] py-12 md:py-16">
          <div className="container">
            <div className="animate-pulse bg-white/20 h-8 w-48" />
          </div>
        </div>
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#ede8e0] animate-pulse aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    }>
      <StorePageContent />
    </Suspense>
  );
}
