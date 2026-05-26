'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore, Locale, Currency } from '@/contexts/StoreContext';
import { ShoppingBag, Menu, X, Globe, ChevronDown } from 'lucide-react';

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'pt', label: 'PT', flag: '🇵🇹' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
];

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: 'EUR', symbol: '€ EUR' },
  { code: 'USD', symbol: '$ USD' },
  { code: 'GBP', symbol: '£ GBP' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, t, locale, setLocale, currency, setCurrency, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/store', label: t('nav.store') },
    { href: '/about', label: t('nav.about') },
  ];

  const isHome = pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-[#f8f5f0]/97 backdrop-blur-md shadow-sm border-b border-[#b8962e]/30'
          : isHome
          ? 'bg-transparent'
          : 'bg-[#f8f5f0]/90 backdrop-blur-sm'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#1a3a3a] border-2 border-[#b8962e] flex items-center justify-center relative">
              <span className="text-white text-xs font-bold tracking-wider">A</span>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#b8962e] rounded-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-[#1a3a3a] text-lg font-medium tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                AZORES
              </span>
              <span
                className="text-[#b8962e] text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                .BIO
              </span>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                    pathname === link.href
                      ? 'text-[#1a3a3a]'
                      : scrolled || !isHome
                      ? 'text-[#6b6b6b] hover:text-[#1a3a3a]'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Actions — desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  scrolled || !isHome ? 'text-[#6b6b6b] hover:text-[#1a3a3a]' : 'text-white/70 hover:text-white'
                }`}
              >
                <Globe size={15} />
                <span className="font-medium">{locale.toUpperCase()}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#ede8e0] shadow-lg min-w-[100px] z-50">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#f8f5f0] transition-colors ${
                        locale === l.code ? 'text-[#1a3a3a] font-medium' : 'text-[#6b6b6b]'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  scrolled || !isHome ? 'text-[#6b6b6b] hover:text-[#1a3a3a]' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="font-medium">{currency}</span>
                <ChevronDown size={12} className={`transition-transform ${currOpen ? 'rotate-180' : ''}`} />
              </button>
              {currOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#ede8e0] shadow-lg min-w-[110px] z-50">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f8f5f0] transition-colors ${
                        currency === c.code ? 'text-[#1a3a3a] font-medium' : 'text-[#6b6b6b]'
                      }`}
                    >
                      {c.symbol}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-2 transition-colors ${
                scrolled || !isHome ? 'text-[#1a3a3a] hover:text-[#2d5a5a]' : 'text-white hover:text-white/80'
              }`}
              aria-label="Carrinho"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#b8962e] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile: cart + menu */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className={`relative ${scrolled || !isHome ? 'text-[#1a3a3a]' : 'text-white'}`}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#b8962e] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={scrolled || !isHome ? 'text-[#1a3a3a]' : 'text-white'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-[#1a3a3a] z-40 flex flex-col">
            <div className="flex-1 flex flex-col justify-center px-8">
              {navLinks.map((link, idx) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <div className="py-5 text-xl font-medium text-white/90 hover:text-white tracking-wide cursor-pointer border-b border-[#b8962e]/20" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {link.label}
                  </div>
                  {idx < navLinks.length - 1 && (
                    <div className="h-px bg-gradient-to-r from-[#b8962e]/40 to-transparent my-0" />
                  )}
                </Link>
              ))}
            </div>
            <div className="px-8 pb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-[#b8962e]/50 to-transparent mb-6" />
              <div className="flex flex-wrap gap-2 mb-4">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      locale === l.code
                        ? 'border-[#b8962e] text-[#b8962e] bg-[#b8962e]/10 font-medium'
                        : 'border-white/20 text-white/50 hover:text-white/80'
                    }`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setCurrency(c.code); setMobileOpen(false); }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      currency === c.code
                        ? 'border-[#b8962e] text-[#b8962e] bg-[#b8962e]/10 font-medium'
                        : 'border-white/20 text-white/50 hover:text-white/80'
                    }`}
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdowns on click outside */}
      {(langOpen || currOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setLangOpen(false); setCurrOpen(false); }}
        />
      )}
    </nav>
  );
}
