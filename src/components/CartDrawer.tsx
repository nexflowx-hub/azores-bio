'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/contexts/StoreContext';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    cartTotal,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    t,
    formatPrice,
    convertPrice,
  } = useStore();

  const subtotal = convertPrice(cartTotal);
  const freeShippingThreshold = 75;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 6.5;
  const total = subtotal + shippingCost;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f5f0] z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ede8e0]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[#1a3a3a]" />
            <h2
              className="text-lg font-medium text-[#1a3a3a]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t('cart.title')}
            </h2>
            {cart.length > 0 && (
              <span className="text-xs text-[#6b6b6b] bg-[#ede8e0] px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="text-[#6b6b6b] hover:text-[#1a3a3a] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress */}
        {cart.length > 0 && subtotal < freeShippingThreshold && (
          <div className="px-6 py-3 bg-[#ede8e0]">
            <div className="flex justify-between text-xs text-[#6b6b6b] mb-1">
              <span>{t('cart.free_shipping')}</span>
              <span className="font-medium text-[#1a3a3a]">
                {formatPrice(freeShippingThreshold - subtotal)} em falta
              </span>
            </div>
            <div className="h-1 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a3a3a] rounded-full transition-all duration-500"
                style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-[#c8b89a]" />
              <p className="text-[#6b6b6b]">{t('cart.empty')}</p>
              <button
                onClick={() => setCartOpen(false)}
                className="text-sm font-medium text-[#1a3a3a] underline underline-offset-4"
              >
                {t('cart.empty.cta')}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 pb-4 border-b border-[#ede8e0] last:border-0"
              >
                {/* Image */}
                <div className="w-20 h-20 bg-[#ede8e0] flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c8b89a]">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a3a3a] leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-sm font-semibold text-[#1a3a3a] mt-1">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 border border-[#ede8e0] flex items-center justify-center text-[#6b6b6b] hover:border-[#1a3a3a] hover:text-[#1a3a3a] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center font-medium text-[#1a3a3a]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-6 h-6 border border-[#ede8e0] flex items-center justify-center text-[#6b6b6b] hover:border-[#1a3a3a] hover:text-[#1a3a3a] transition-colors disabled:opacity-40"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="ml-auto text-[#c8b89a] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#ede8e0] space-y-3 bg-white">
            <div className="flex justify-between text-sm text-[#6b6b6b]">
              <span>{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6b6b6b]">
              <span>{t('cart.shipping')}</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-medium">Grátis</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>
            <div className="divider-gold" />
            <div className="flex justify-between font-semibold text-[#1a3a3a]">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <button
                className="w-full bg-[#1a3a3a] text-white py-3.5 text-sm font-medium tracking-widest uppercase hover:bg-[#2d5a5a] transition-colors mt-2"
                style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
              >
                {t('cart.checkout')}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
