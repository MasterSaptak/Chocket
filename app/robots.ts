import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/superadmin/', '/seller/dashboard/', '/api/'],
    },
    sitemap: 'https://chocket.saptech.online/sitemap.xml',
  };
}
