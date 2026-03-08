import type { OfferConfig } from '@/components/ui/NewsOfferModal';

/**
 * Current offer/news popup shown on every page load until closed.
 * To show a new offer: change offerId and update imageSrc/alt.
 */
export const currentOffer: OfferConfig | null = {
  offerId: 'womens-day-2026',
  imageSrc: '/images/banners/womansday-banner.webp',
  alt: "The Women Behind Morandi Lifestyle - Happy Women's Day!",
  // ctaUrl: '/offers/womens-day', // optional: link when user clicks image
};
