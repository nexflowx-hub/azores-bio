import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/success'],
      },
    ],
    sitemap: 'https://azores.bio/sitemap.xml',
  };
}
