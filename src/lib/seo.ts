const DEFAULT_SITE_URL = 'https://morandilifestyle.com';

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, '');
}

export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeUrl(window.location.origin);
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_BRANCH_URL ||
    '';

  if (!envUrl) {
    return DEFAULT_SITE_URL;
  }

  const prefixed = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  try {
    return normalizeUrl(new URL(prefixed).toString());
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(path = '/') {
  const siteUrl = getSiteUrl();
  if (!path) return siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getSitemapStaticRoutes() {
  return [
    '/',
    '/about',
    '/collections',
    '/products',
    '/blog',
    '/contact',
    '/account',
    '/wishlist',
    '/cart',
    '/checkout',
    '/order-success',
  ];
}

