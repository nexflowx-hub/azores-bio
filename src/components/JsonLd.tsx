/**
 * JSON-LD Structured Data for AZORES.BIO
 * Provides rich search results for Google, Bing, etc.
 */

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AZORES.BIO',
    url: 'https://azores.bio',
    logo: 'https://azores.bio/favicon.png',
    description:
      'Produtos premium das 9 ilhas dos Açores, selecionados com rigor e entregues em todo o mundo.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Macela',
      addressLocality: 'Calheta',
      addressRegion: 'São Jorge, Açores',
      postalCode: '9875-030',
      addressCountry: 'PT',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@azores.bio',
      telephone: '+351-295-000-000',
      contactType: 'customer service',
      availableLanguage: ['Portuguese', 'English', 'French', 'German'],
    },
    sameAs: [
      'https://instagram.com/azores.bio',
      'https://facebook.com/azores.bio',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AZORES.BIO',
    url: 'https://azores.bio',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://azores.bio/store?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function StoreJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'AZORES.BIO',
    url: 'https://azores.bio/store',
    description:
      'Loja online de produtos premium dos Açores — Queijos DOP, vinhos, conservas, chás.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Calheta',
      addressRegion: 'Açores',
      addressCountry: 'PT',
    },
    priceRange: '€€',
    openingHours: 'Mo-Fr 09:00-18:00',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({
  product,
}: {
  product: {
    name: string;
    description?: string;
    priceEur: number;
    images: string[];
    sku?: string;
    category?: string;
    origin?: string;
  };
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.images.length > 0 ? product.images : undefined,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.origin || 'Açores',
    },
    offers: {
      '@type': 'Offer',
      price: product.priceEur.toFixed(2),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: 'https://azores.bio/store',
      seller: {
        '@type': 'Organization',
        name: 'AZORES.BIO',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
