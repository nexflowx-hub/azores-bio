import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loja — Produtos dos Açores',
  description:
    'Explore a seleção de produtos premium dos Açores. Queijos DOP São Jorge, vinho do Pico, chá Gorreana, conservas, licores e muito mais. Envio internacional.',
  alternates: {
    canonical: 'https://azores.bio/store',
  },
  openGraph: {
    title: 'Loja — AZORES.BIO',
    description:
      'Produtos premium dos Açores — Queijos DOP, vinhos, conservas, chás e muito mais.',
    url: 'https://azores.bio/store',
  },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
