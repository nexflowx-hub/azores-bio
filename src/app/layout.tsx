import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import MariaChat from "@/components/MariaChat";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  themeColor: '#1a3a3a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://azores.bio'),
  formatDetection: {
    telephone: false,
    email: true,
    address: true,
  },
  title: {
    default: 'AZORES.BIO — Produtos Premium dos Açores',
    template: '%s | AZORES.BIO',
  },
  description:
    'Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo. Queijos DOP São Jorge, vinho do Pico, chá Gorreana, conservas e muito mais. Envio internacional.',
  keywords: [
    'Açores', 'Azores', 'produtos açorianos', 'queijo São Jorge',
    'vinho do Pico', 'chá Gorreana', 'DOP', 'gourmet', 'Portugal',
    'bio', 'conservas açores', 'licores açores', 'compotas açores',
    'produtos portugueses', 'azeite açores', 'mel açores',
    'pastelaria açores', 'envio internacional', 'comprar online',
    'Azorean products', 'produits Açores', 'Azoren Produkte',
  ],
  authors: [{ name: 'Azores Meet, Lda', url: 'https://azores.bio' }],
  creator: 'Azores Meet, Lda',
  publisher: 'Azores Meet, Lda',
  category: 'shopping',
  classification: 'E-commerce — Gourmet Food & Beverages',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://azores.bio',
    languages: {
      'pt-PT': 'https://azores.bio',
      'en-GB': 'https://azores.bio/?lang=en',
      'fr-FR': 'https://azores.bio/?lang=fr',
      'de-DE': 'https://azores.bio/?lang=de',
    },
  },
  openGraph: {
    title: 'AZORES.BIO — Produtos Premium dos Açores',
    description:
      'Produtos premium das 9 ilhas dos Açores — Queijos DOP, vinhos, conservas, chás e muito mais. Entrega mundial.',
    url: 'https://azores.bio',
    siteName: 'AZORES.BIO',
    type: 'website',
    locale: 'pt_PT',
    alternateLocale: ['en_GB', 'fr_FR', 'de_DE'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AZORES.BIO — Produtos Premium dos Açores',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AZORES.BIO — Produtos Premium dos Açores',
    description:
      'Produtos premium das 9 ilhas dos Açores — Queijos DOP, vinhos, conservas, chás. Entrega mundial.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className="scroll-pt-20">
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <MariaChat />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
