import type { MetadataRoute } from 'next';
import { absoluteUrl, getSiteUrl, getSitemapStaticRoutes } from '@/lib/seo';
import { getProductsWithPagination } from '@/lib/products-api';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = getSitemapStaticRoutes().map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const productsResponse = await getProductsWithPagination({ limit: 100 });
    productRoutes =
      productsResponse.data?.map((product) => ({
        url: absoluteUrl(`/products/${product.slug ?? product.id}`),
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })) ?? [];
  } catch (error) {
    console.error('Unable to build product sitemap', error);
  }

  return [...staticRoutes, ...productRoutes];
}

