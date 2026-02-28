const DEFAULT_SITE_URL = 'https://morandilifestyle.com';

export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeUrl(window.location.origin);
  }

  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicitUrl) {
    return normalizeUrl(withProtocol(explicitUrl));
  }

  const isPreviewEnv =
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';

  if (isPreviewEnv) {
    const vercelUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_BRANCH_URL;
    if (vercelUrl) {
      return normalizeUrl(withProtocol(vercelUrl));
    }
  }

  return DEFAULT_SITE_URL;
}

function withProtocol(url: string) {
  if (!url) return DEFAULT_SITE_URL;
  return url.startsWith('http') ? url : `https://${url}`;
}

function normalizeUrl(url: string) {
  try {
    return new URL(url).origin;
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
    '/blog',
    '/contact',
    '/account',
  ];
}

