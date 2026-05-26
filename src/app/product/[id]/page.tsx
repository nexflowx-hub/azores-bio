'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Check, ArrowLeft, Minus, Plus, MapPin, Package } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';
import { AtlasProduct } from '@/lib/types';
import { fetchProductById, fetchProducts } from '@/lib/atlas';
import { ProductJsonLd } from '@/components/JsonLd';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string || '';
  const { addToCart, t, formatPrice, getProductName, getProductDescription, locale } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<AtlasProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<AtlasProduct[]>([]);

  useEffect(() => {
    if (productId) {
      let cancelled = false;
      fetchProductById(productId)
        .then((data) => {
          if (!cancelled) {
            setProduct(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setProduct(null);
            setIsLoading(false);
          }
        });
      return () => { cancelled = true; };
    }
  }, [productId]);

  useEffect(() => {
    if (product?.category) {
      fetchProducts({ category: product.category, limit: 5 })
        .then((data) => {
          const related = (data.products || []).filter((p) => p.id !== productId).slice(0, 4);
          setRelatedProducts(related);
        })
        .catch(() => setRelatedProducts([]));
    }
  }, [product?.category, productId]);

  const displayName = product ? getProductName(product) : '';
  const displayDesc = product ? getProductDescription(product) : '';

  const images: string[] = (() => {
    if (!product) return [];
    return product.images && product.images.length > 0 ? product.images : [];
  })();

  const isOutOfStock = product ? (product.stock ?? 0) <= 0 : false;
  const hasDiscount = product?.compareAtPrice && product.compareAtPrice > product.priceEur;

  const handleAddToCart = () => {
    if (!product || isOutOfStock || added) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        nameEn: product.nameEn,
        priceEur: product.priceEur,
        image: product.images?.[0],
        sku: product.sku,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] pt-24">
        <div className="container py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-[#ede8e0] animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-[#ede8e0] animate-pulse w-1/3" />
              <div className="h-10 bg-[#ede8e0] animate-pulse w-2/3" />
              <div className="h-8 bg-[#ede8e0] animate-pulse w-1/4" />
              <div className="h-32 bg-[#ede8e0] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🌿</p>
          <p className="text-xl font-medium text-[#1a3a3a]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Produto não encontrado
          </p>
          <Link href="/store">
            <button className="mt-6 text-sm text-[#6b6b6b] underline underline-offset-4">
              Voltar à loja
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] pt-20 lg:pt-24">
      <div className="container py-8 md:py-12">
        {/* Structured Data for SEO */}
        <ProductJsonLd product={product} />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6b6b6b] mb-6 md:mb-8">
          <Link href="/" className="hover:text-[#1a3a3a] cursor-pointer transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/store" className="hover:text-[#1a3a3a] cursor-pointer transition-colors">
            Loja
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/store?cat=${product.category}`} className="hover:text-[#1a3a3a] cursor-pointer transition-colors">
                {t('cat.' + product.category)}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1a3a3a] line-clamp-1">{displayName}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden bg-[#f0ebe3]">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={48} className="text-[#c8b89a]" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square overflow-hidden border-2 transition-colors min-h-[44px] ${
                      selectedImage === i ? 'border-[#1a3a3a]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {/* Origin */}
            {product.origin && (
              <div className="flex items-center gap-1.5 text-[#b8962e] text-xs tracking-[0.25em] uppercase mb-3">
                <MapPin size={12} />
                <span style={{ fontFamily: "'Inter', sans-serif" }}>{product.origin}</span>
              </div>
            )}

            {/* Name */}
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-[#1a3a3a] leading-tight mb-3 sm:mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {displayName}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <span className="text-2xl font-semibold text-[#1a3a3a]">
                {formatPrice(product.priceEur)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#6b6b6b] line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="bg-[#b8962e] text-white text-xs font-medium px-2 py-0.5">
                    -{Math.round(((product.compareAtPrice! - product.priceEur) / product.compareAtPrice!) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Gold line */}
            <div className="h-px bg-gradient-to-r from-[#b8962e]/40 via-[#b8962e]/20 to-transparent mb-6" />

            {/* Description */}
            {displayDesc && (
              <p className="text-[#3d3d3d] text-sm leading-relaxed mb-6">{displayDesc}</p>
            )}

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-[#6b6b6b]">{t('cart.quantity')}:</span>
                <div className="flex items-center border border-[#ede8e0]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#6b6b6b] hover:text-[#1a3a3a] hover:bg-[#f8f5f0] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-[#1a3a3a]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock ?? 999, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#6b6b6b] hover:text-[#1a3a3a] hover:bg-[#f8f5f0] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-[#6b6b6b]">{product.stock ?? 0} disponíveis</span>
              </div>
            )}

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
                added
                  ? 'bg-green-600 text-white'
                  : isOutOfStock
                  ? 'bg-[#6b6b6b] text-white cursor-not-allowed'
                  : 'bg-[#1a3a3a] text-white hover:bg-[#2d5a5a]'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} />
                  Adicionado ao Carrinho!
                </>
              ) : isOutOfStock ? (
                t('product.out_of_stock')
              ) : (
                <>
                  <ShoppingBag size={16} />
                  {t('product.add_to_cart')}
                </>
              )}
            </button>

            {/* Details */}
            <div className="mt-8 space-y-3 border-t border-[#ede8e0] pt-6">
              {product.sku && (
                <div className="flex justify-between text-xs text-[#6b6b6b]">
                  <span className="uppercase tracking-wide">{t('product.sku')}</span>
                  <span className="font-medium text-[#1a3a3a]">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between text-xs text-[#6b6b6b]">
                  <span className="uppercase tracking-wide">Categoria</span>
                  <span className="font-medium text-[#1a3a3a]">
                    {t('cat.' + product.category)}
                  </span>
                </div>
              )}
            </div>

            {/* Shipping info */}
            <div className="mt-6 bg-[#f0ebe3] p-4 flex items-start gap-3">
              <Package size={16} className="text-[#b8962e] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#1a3a3a] mb-0.5">Envio Internacional</p>
                <p className="text-xs text-[#6b6b6b]">
                  Europa: 3-7 dias úteis · Internacional: 7-14 dias úteis
                  <br />
                  Envio gratuito em compras acima de €75
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="h-px bg-gradient-to-r from-transparent via-[#ede8e0] to-transparent mb-12" />
            <h2
              className="text-2xl font-medium text-[#1a3a3a] mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t('product.related')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
