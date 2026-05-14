'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────
export type Locale = 'pt' | 'en' | 'fr' | 'de';
export type Currency = 'EUR' | 'USD' | 'GBP';

export interface CartItem {
  productId: number;
  name: string;
  nameEn?: string | null;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  sku?: string | null;
  stock: number;
}

export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  namePt: string;
  nameFr?: string | null;
  nameDe?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  productCount: number;
}

export interface Product {
  id: number;
  sku?: string | null;
  name: string;
  nameEn?: string | null;
  nameFr?: string | null;
  nameDe?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionDe?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  categoryId?: number | null;
  imageUrl?: string | null;
  images?: string | null;
  weight?: number | null;
  origin?: string | null;
  featured: boolean;
  active: boolean;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    slug: string;
    nameEn: string;
    namePt: string;
    nameFr?: string | null;
    nameDe?: string | null;
    description?: string | null;
    imageUrl?: string | null;
  } | null;
}

// ─── Translations ─────────────────────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  pt: {
    'nav.home': 'Início',
    'nav.store': 'Loja',
    'nav.about': 'Sobre',
    'nav.contact': 'Contacto',
    'home.hero.title': 'O Sabor Autêntico dos Açores',
    'home.hero.subtitle': 'Produtos premium das 9 ilhas, selecionados com rigor e entregues em todo o mundo.',
    'home.hero.cta': 'Explorar a Loja',
    'home.featured': 'Produtos em Destaque',
    'home.categories': 'Categorias',
    'home.about.title': 'Da Terra Vulcânica ao Seu Lar',
    'home.about.text': 'Os Açores são um arquipélago único no coração do Atlântico, onde a natureza vulcânica cria condições únicas para produzir alimentos de qualidade excecional.',
    'cat.queijos': 'Queijos',
    'cat.manteigas': 'Manteigas',
    'cat.conservas': 'Conservas',
    'cat.vinhos': 'Vinhos',
    'cat.licores': 'Licores',
    'cat.cha': 'Chás',
    'cat.pastelaria': 'Pastelaria',
    'cat.compotas': 'Compotas & Mel',
    'cat.pimentas': 'Pimentas',
    'cat.bebidas': 'Bebidas',
    'cat.charcutaria': 'Charcutaria',
    'cat.outros': 'Outros',
    'product.add_to_cart': 'Adicionar ao Carrinho',
    'product.added': 'Adicionado!',
    'product.out_of_stock': 'Esgotado',
    'product.related': 'Produtos Relacionados',
    'product.sku': 'Referência',
    'cart.title': 'Carrinho',
    'cart.empty': 'O seu carrinho está vazio',
    'cart.empty.cta': 'Continuar a comprar',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Envio',
    'cart.total': 'Total',
    'cart.checkout': 'Finalizar Compra',
    'cart.free_shipping': 'Envio gratuito a partir de €75',
    'cart.quantity': 'Quantidade',
    'checkout.title': 'Finalizar Compra',
    'store.title': 'Toda a Loja',
    'store.all': 'Todos os Produtos',
    'store.filter': 'Filtrar',
    'store.sort': 'Ordenar',
    'store.sort.featured': 'Destaque',
    'store.sort.price_asc': 'Preço: Menor',
    'store.sort.price_desc': 'Preço: Maior',
    'store.sort.name': 'Nome A-Z',
    'store.results': 'produtos',
    'store.empty': 'Nenhum produto encontrado',
    'footer.legal': 'Azores Meet, Lda | NIF: 513553169',
    'footer.address': 'Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores',
    'footer.rights': 'Todos os direitos reservados',
    'footer.shipping': 'Envios e Devoluções',
    'footer.privacy': 'Política de Privacidade',
    'footer.terms': 'Termos e Condições',
  },
  en: {
    'nav.home': 'Home',
    'nav.store': 'Shop',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'home.hero.title': 'The Authentic Taste of the Azores',
    'home.hero.subtitle': 'Premium products from 9 islands, carefully selected and delivered worldwide.',
    'home.hero.cta': 'Explore the Shop',
    'home.featured': 'Featured Products',
    'home.categories': 'Categories',
    'home.about.title': 'From Volcanic Soil to Your Home',
    'home.about.text': 'The Azores are a unique archipelago in the heart of the Atlantic, where volcanic nature creates exceptional conditions for producing outstanding quality food.',
    'cat.queijos': 'Cheeses',
    'cat.manteigas': 'Butters',
    'cat.conservas': 'Preserves',
    'cat.vinhos': 'Wines',
    'cat.licores': 'Liqueurs',
    'cat.cha': 'Teas',
    'cat.pastelaria': 'Pastries',
    'cat.compotas': 'Jams & Honey',
    'cat.pimentas': 'Peppers',
    'cat.bebidas': 'Beverages',
    'cat.charcutaria': 'Charcuterie',
    'cat.outros': 'Others',
    'product.add_to_cart': 'Add to Cart',
    'product.added': 'Added!',
    'product.out_of_stock': 'Out of Stock',
    'product.related': 'Related Products',
    'product.sku': 'SKU',
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.empty.cta': 'Continue shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.free_shipping': 'Free shipping over €75',
    'cart.quantity': 'Quantity',
    'checkout.title': 'Checkout',
    'store.title': 'All Products',
    'store.all': 'All Products',
    'store.filter': 'Filter',
    'store.sort': 'Sort',
    'store.sort.featured': 'Featured',
    'store.sort.price_asc': 'Price: Low to High',
    'store.sort.price_desc': 'Price: High to Low',
    'store.sort.name': 'Name A-Z',
    'store.results': 'products',
    'store.empty': 'No products found',
    'footer.legal': 'Azores Meet, Lda | VAT: 513553169',
    'footer.address': 'Macela, 9875-030 Santo Antão, Calheta (São Jorge), Azores',
    'footer.rights': 'All rights reserved',
    'footer.shipping': 'Shipping & Returns',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.store': 'Boutique',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'home.hero.title': 'Le Goût Authentique des Açores',
    'home.hero.subtitle': 'Produits premium de 9 îles, soigneusement sélectionnés et livrés dans le monde entier.',
    'home.hero.cta': 'Explorer la Boutique',
    'home.featured': 'Produits en Vedette',
    'home.categories': 'Catégories',
    'home.about.title': 'De la Terre Volcanique à Votre Maison',
    'home.about.text': 'Les Açores sont un archipel unique au cœur de l\'Atlantique, où la nature volcanique crée des conditions exceptionnelles pour produire des aliments de qualité exceptionnelle.',
    'cat.queijos': 'Fromages',
    'cat.manteigas': 'Beurres',
    'cat.conservas': 'Conserves',
    'cat.vinhos': 'Vins',
    'cat.licores': 'Liqueurs',
    'cat.cha': 'Thés',
    'cat.pastelaria': 'Pâtisseries',
    'cat.compotas': 'Confitures & Miel',
    'cat.pimentas': 'Poivrons',
    'cat.bebidas': 'Boissons',
    'cat.charcutaria': 'Charcuterie',
    'cat.outros': 'Autres',
    'product.add_to_cart': 'Ajouter au Panier',
    'product.added': 'Ajouté!',
    'product.out_of_stock': 'Rupture de Stock',
    'product.related': 'Produits Similaires',
    'product.sku': 'Référence',
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.empty.cta': 'Continuer les achats',
    'cart.subtotal': 'Sous-total',
    'cart.shipping': 'Livraison',
    'cart.total': 'Total',
    'cart.checkout': 'Commander',
    'cart.free_shipping': 'Livraison gratuite à partir de €75',
    'cart.quantity': 'Quantité',
    'checkout.title': 'Commander',
    'store.title': 'Tous les Produits',
    'store.all': 'Tous les Produits',
    'store.filter': 'Filtrer',
    'store.sort': 'Trier',
    'store.sort.featured': 'En vedette',
    'store.sort.price_asc': 'Prix: Croissant',
    'store.sort.price_desc': 'Prix: Décroissant',
    'store.sort.name': 'Nom A-Z',
    'store.results': 'produits',
    'store.empty': 'Aucun produit trouvé',
    'footer.legal': 'Azores Meet, Lda | TVA: 513553169',
    'footer.address': 'Macela, 9875-030 Santo Antão, Calheta (São Jorge), Açores',
    'footer.rights': 'Tous droits réservés',
    'footer.shipping': 'Livraison & Retours',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions Générales',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.store': 'Shop',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    'home.hero.title': 'Der Authentische Geschmack der Azoren',
    'home.hero.subtitle': 'Premium-Produkte von 9 Inseln, sorgfältig ausgewählt und weltweit geliefert.',
    'home.hero.cta': 'Shop Entdecken',
    'home.featured': 'Ausgewählte Produkte',
    'home.categories': 'Kategorien',
    'home.about.title': 'Von Vulkanischem Boden zu Ihrem Zuhause',
    'home.about.text': 'Die Azoren sind ein einzigartiger Archipel im Herzen des Atlantiks, wo die vulkanische Natur außergewöhnliche Bedingungen für die Herstellung von Lebensmitteln höchster Qualität schafft.',
    'cat.queijos': 'Käse',
    'cat.manteigas': 'Butter',
    'cat.conservas': 'Konserven',
    'cat.vinhos': 'Weine',
    'cat.licores': 'Liköre',
    'cat.cha': 'Tees',
    'cat.pastelaria': 'Gebäck',
    'cat.compotas': 'Marmeladen & Honig',
    'cat.pimentas': 'Paprika',
    'cat.bebidas': 'Getränke',
    'cat.charcutaria': 'Wurstwaren',
    'cat.outros': 'Sonstiges',
    'product.add_to_cart': 'In den Warenkorb',
    'product.added': 'Hinzugefügt!',
    'product.out_of_stock': 'Ausverkauft',
    'product.related': 'Ähnliche Produkte',
    'product.sku': 'Artikelnummer',
    'cart.title': 'Warenkorb',
    'cart.empty': 'Ihr Warenkorb ist leer',
    'cart.empty.cta': 'Weiter einkaufen',
    'cart.subtotal': 'Zwischensumme',
    'cart.shipping': 'Versand',
    'cart.total': 'Gesamt',
    'cart.checkout': 'Zur Kasse',
    'cart.free_shipping': 'Kostenloser Versand ab €75',
    'cart.quantity': 'Menge',
    'checkout.title': 'Zur Kasse',
    'store.title': 'Alle Produkte',
    'store.all': 'Alle Produkte',
    'store.filter': 'Filtern',
    'store.sort': 'Sortieren',
    'store.sort.featured': 'Empfohlen',
    'store.sort.price_asc': 'Preis: Aufsteigend',
    'store.sort.price_desc': 'Preis: Absteigend',
    'store.sort.name': 'Name A-Z',
    'store.results': 'Produkte',
    'store.empty': 'Keine Produkte gefunden',
    'footer.legal': 'Azores Meet, Lda | USt-IdNr.: 513553169',
    'footer.address': 'Macela, 9875-030 Santo Antão, Calheta (São Jorge), Azoren',
    'footer.rights': 'Alle Rechte vorbehalten',
    'footer.shipping': 'Versand & Rückgabe',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.terms': 'Allgemeine Geschäftsbedingungen',
  },
};

// ─── Exchange rates ───────────────────────────────────────────────────────
const EXCHANGE_RATES: Record<Currency, number> = { EUR: 1, USD: 1.08, GBP: 0.86 };
const CURRENCY_SYMBOLS: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£' };

// ─── Context ──────────────────────────────────────────────────────────────
interface StoreContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: string) => string;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  getCategoryName: (category: { namePt: string; nameEn: string; nameFr?: string | null; nameDe?: string | null }) => string;
  getProductName: (product: { name: string; nameEn?: string | null; nameFr?: string | null; nameDe?: string | null }) => string;
  getProductDescription: (product: { description?: string | null; descriptionEn?: string | null; descriptionFr?: string | null; descriptionDe?: string | null }) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'azoresbio-cart';
const LOCALE_KEY = 'azoresbio-locale';
const CURRENCY_KEY = 'azoresbio-currency';

function loadFromStorage<T>(key: string, fallback: T, validator?: (v: unknown) => boolean): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!validator || validator(parsed)) return parsed as T;
    }
  } catch { /* ignore */ }
  return fallback;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    loadFromStorage<Locale>(LOCALE_KEY, 'pt', (v) => typeof v === 'string' && !!translations[v as string])
  );
  const [currency, setCurrencyState] = useState<Currency>(() =>
    loadFromStorage<Currency>(CURRENCY_KEY, 'EUR', (v) => typeof v === 'string' && ['EUR', 'USD', 'GBP'].includes(v as string))
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(CART_KEY, [], (v) => Array.isArray(v))
  );
  const [isCartOpen, setCartOpen] = useState(false);
  const hasMounted = useRef(false);

  // Mark mounted after first render
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Persist cart
  useEffect(() => {
    if (hasMounted.current) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist locale
  useEffect(() => {
    if (hasMounted.current) localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  // Persist currency
  useEffect(() => {
    if (hasMounted.current) localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), []);

  const t = useCallback(
    (key: string): string => translations[locale]?.[key] || translations['pt']?.[key] || key,
    [locale]
  );

  const convertPrice = useCallback(
    (amount: number): number => Math.round(amount * EXCHANGE_RATES[currency] * 100) / 100,
    [currency]
  );

  const formatPrice = useCallback(
    (price: number): string => {
      const converted = convertPrice(price);
      return `${CURRENCY_SYMBOLS[currency]}${converted.toFixed(2)}`;
    },
    [currency, convertPrice]
  );

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCategoryName = useCallback(
    (category: { namePt: string; nameEn: string; nameFr?: string | null; nameDe?: string | null }): string => {
      switch (locale) {
        case 'en': return category.nameEn || category.namePt;
        case 'fr': return category.nameFr || category.nameEn || category.namePt;
        case 'de': return category.nameDe || category.nameEn || category.namePt;
        default: return category.namePt;
      }
    },
    [locale]
  );

  const getProductName = useCallback(
    (product: { name: string; nameEn?: string | null; nameFr?: string | null; nameDe?: string | null }): string => {
      switch (locale) {
        case 'en': return product.nameEn || product.name;
        case 'fr': return product.nameFr || product.nameEn || product.name;
        case 'de': return product.nameDe || product.nameEn || product.name;
        default: return product.name;
      }
    },
    [locale]
  );

  const getProductDescription = useCallback(
    (product: { description?: string | null; descriptionEn?: string | null; descriptionFr?: string | null; descriptionDe?: string | null }): string => {
      switch (locale) {
        case 'en': return product.descriptionEn || product.description || '';
        case 'fr': return product.descriptionFr || product.descriptionEn || product.description || '';
        case 'de': return product.descriptionDe || product.descriptionEn || product.description || '';
        default: return product.description || '';
      }
    },
    [locale]
  );

  return (
    <StoreContext.Provider
      value={{
        locale, setLocale, currency, setCurrency,
        t, cart, addToCart, removeFromCart, updateQuantity, clearCart,
        cartCount, cartTotal, formatPrice, convertPrice,
        isCartOpen, setCartOpen,
        getCategoryName, getProductName, getProductDescription,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
