'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/contexts/StoreContext';
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useStore();

  return (
    <footer className="bg-[#1a3a3a] text-white mt-auto">
      {/* Gold line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#b8962e] to-transparent" />

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-white text-lg font-medium tracking-tight"
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
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                <Youtube size={16} />
              </a>
              <a
                href="mailto:info@azores.bio"
                className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Store Links */}
          <div>
            <h4
              className="text-white font-medium mb-5 text-sm tracking-widest uppercase"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Loja
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/store', label: 'Todos os Produtos' },
                { href: '/store?cat=queijos', label: 'Queijos' },
                { href: '/store?cat=vinhos', label: 'Vinhos' },
                { href: '/store?cat=conservas', label: 'Conservas' },
                { href: '/store?cat=licores', label: 'Licores' },
                { href: '/store?cat=cha', label: 'Chás' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4
              className="text-white font-medium mb-5 text-sm tracking-widest uppercase"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Informações
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/about', label: 'Sobre Nós' },
                { href: '/envios-e-devolucoes', label: t('footer.shipping') },
                { href: '/politica-de-privacidade', label: t('footer.privacy') },
                { href: '/termos-e-condicoes', label: t('footer.terms') },
                { href: 'mailto:info@azores.bio', label: 'Contacto' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
              {/* Livro de Reclamações link */}
              <li>
                <a
                  href="https://www.livroreclamacoes.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 text-sm hover:text-[#b8962e] transition-colors inline-flex items-center gap-1.5"
                >
                  <Image
                    src="/images/payments/livro-reclamacoes.svg"
                    alt="Livro de Reclamações"
                    width={60}
                    height={20}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                  />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white font-medium mb-5 text-sm tracking-widest uppercase"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <span className="mt-0.5 flex-shrink-0 text-[#b8962e]"><MapPin size={14} className="animate-pulse" style={{ animationDuration: '3s' }} /></span>
                <span>
                  Macela, 9875-030<br />
                  Santo Antão, Calheta<br />
                  São Jorge, Açores
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Mail size={14} className="flex-shrink-0 text-[#b8962e]" />
                <a href="mailto:info@azores.bio" className="hover:text-white transition-colors">
                  info@azores.bio
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Phone size={14} className="flex-shrink-0 text-[#b8962e]" />
                <span>+351 295 000 000</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <h4
                className="text-white font-medium mb-3 text-sm tracking-widest uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Newsletter
              </h4>
              <p className="text-white/50 text-xs mb-3">Receba novidades e ofertas exclusivas.</p>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="flex-1 bg-white/10 border border-white/20 text-white text-xs px-3 py-2 placeholder:text-white/30 focus:outline-none focus:border-[#b8962e] transition-colors"
                />
                <button className="bg-[#b8962e] text-white text-xs font-medium px-4 py-2 hover:bg-[#a6832a] transition-colors tracking-wider uppercase">
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments & Livro de Reclamações bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Livro de Reclamações */}
            <a
              href="https://www.livroreclamacoes.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity group"
              aria-label="Livro de Reclamações"
            >
              <Image
                src="/images/payments/livro-reclamacoes.svg"
                alt="Livro de Reclamações"
                width={120}
                height={40}
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </a>

            {/* Payment Methods */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-white/40 text-xs uppercase tracking-widest mr-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                {t('footer.payments')}
              </span>
              <div className="flex items-center gap-2">
                <Image
                  src="/images/payments/visa.svg"
                  alt="Visa"
                  width={40}
                  height={26}
                  className="opacity-80 hover:opacity-100 transition-opacity rounded"
                />
                <Image
                  src="/images/payments/mastercard.svg"
                  alt="Mastercard"
                  width={40}
                  height={26}
                  className="opacity-80 hover:opacity-100 transition-opacity rounded"
                />
                <Image
                  src="/images/payments/mbway.svg"
                  alt="MB WAY"
                  width={40}
                  height={26}
                  className="opacity-80 hover:opacity-100 transition-opacity rounded"
                />
                <Image
                  src="/images/payments/multibanco.svg"
                  alt="Multibanco"
                  width={40}
                  height={26}
                  className="opacity-80 hover:opacity-100 transition-opacity rounded"
                />
                <Image
                  src="/images/payments/bizum.svg"
                  alt="Bizum"
                  width={40}
                  height={26}
                  className="opacity-80 hover:opacity-100 transition-opacity rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <div className="text-center md:text-left">
              <p className="font-medium text-white/60">
                {t('footer.legal')} | {t('footer.address')}
              </p>
            </div>
            <p>
              © {new Date().getFullYear()} AZORES.BIO — {t('footer.rights')}
            </p>
            <p className="text-white/20 text-[10px] mt-1">
              Powered by Atlas Core V2
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
