'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/contexts/StoreContext';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useStore();

  return (
    <footer className="bg-[#1a3a3a] text-white mt-auto">
      {/* Gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#b8962e] to-transparent" />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
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
                { href: '#', label: t('footer.shipping') },
                { href: '#', label: t('footer.privacy') },
                { href: '#', label: t('footer.terms') },
                { href: '#', label: 'Contacto' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="text-white/60 text-sm hover:text-white transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
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
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#b8962e]" />
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
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
