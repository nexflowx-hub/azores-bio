import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description:
    'Conheça a AZORES.BIO — a nossa missão de levar os melhores produtos das 9 ilhas dos Açores ao mundo. Produtos DOP, artesanais e sustentáveis.',
  alternates: {
    canonical: 'https://azores.bio/about',
  },
  openGraph: {
    title: 'Sobre Nós — AZORES.BIO',
    description:
      'A missão da AZORES.BIO: levar os melhores produtos das 9 ilhas dos Açores ao mundo.',
    url: 'https://azores.bio/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
