import type { MetadataRoute } from 'next';
import { getSiteUrl, getSitemapStaticRoutes } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = getSitemapStaticRoutes().map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  return staticRoutes;
}
