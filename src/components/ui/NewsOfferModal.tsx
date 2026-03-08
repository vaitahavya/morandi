'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export type OfferConfig = {
  /** Unique ID for this offer – changing this shows the popup again (for new offers) */
  offerId: string;
  /** Image URL (e.g. /images/offers/womens-day-2026.png) */
  imageSrc: string;
  /** Alt text for the image */
  alt: string;
  /** Optional CTA URL – if set, clicking image navigates */
  ctaUrl?: string;
};

type NewsOfferModalProps = {
  config: OfferConfig;
};

export default function NewsOfferModal({ config }: NewsOfferModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal: 90% viewport height, image fits inside */}
      <div className="relative z-10 flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <button
          onClick={handleClose}
          className="absolute -right-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-t-lg">
          {config.ctaUrl ? (
            <a
              href={config.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative h-full w-full"
            >
              <Image
                id="offer-modal-title"
                src={config.imageSrc}
                alt={config.alt}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </a>
          ) : (
            <Image
              id="offer-modal-title"
              src={config.imageSrc}
              alt={config.alt}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          )}
        </div>
      </div>
    </div>
  );
}
