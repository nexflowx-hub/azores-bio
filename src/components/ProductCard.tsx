'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

interface Product {
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
  featured?: boolean;
  origin?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  category?: {
    slug: string;
    nameEn: string;
    namePt: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, t, formatPrice, getProductName } = useStore();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayName = getProductName(product);

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || added) return;

    addToCart({
      productId: product.id,
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      imageUrl: product.imageUrl,
      sku: product.sku,
      stock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a3a3a]/10">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#f0ebe3]">
          {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-[#c8b89a]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="bg-[#1a3a3a] text-white text-[9px] font-medium tracking-[0.15em] uppercase px-2 py-1">
                Destaque
              </span>
            )}
            {hasDiscount && (
              <span className="bg-[#b8962e] text-white text-[9px] font-medium tracking-[0.1em] uppercase px-2 py-1">
                -{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-[#6b6b6b] text-white text-[9px] font-medium tracking-[0.1em] uppercase px-2 py-1">
                Esgotado
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`absolute bottom-0 left-0 right-0 py-3 text-xs font-medium tracking-widest uppercase transition-all duration-300 ${
              added
                ? 'bg-green-600 text-white translate-y-0'
                : isOutOfStock
                ? 'bg-[#6b6b6b] text-white translate-y-0 cursor-not-allowed'
                : 'bg-[#1a3a3a] text-white translate-y-full group-hover:translate-y-0'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {added ? (
                <>
                  <Check size={13} />
                  {t('product.added')}
                </>
              ) : isOutOfStock ? (
                t('product.out_of_stock')
              ) : (
                <>
                  <ShoppingBag size={13} />
                  {t('product.add_to_cart')}
                </>
              )}
            </span>
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {product.origin && (
            <p
              className="text-[#b8962e] text-[10px] tracking-[0.2em] uppercase mb-1.5"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {product.origin}
            </p>
          )}
          <h3
            className="text-sm font-medium text-[#1a3a3a] leading-snug line-clamp-2 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {displayName}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#1a3a3a]">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#6b6b6b] line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
