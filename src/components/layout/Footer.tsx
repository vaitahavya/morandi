'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-deep-charcoal text-morandi-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="md:col-span-2">
            <h3 className="text-xl font-serif font-bold text-morandi-white mb-4">Morandi Lifestyle</h3>
            <p className="text-morandi-white/75 font-sans leading-relaxed mb-8 max-w-md text-sm">
              Where every mother blooms. Comfortable maternity and baby apparel crafted for every stage of motherhood.
            </p>
            <div>
              <h4 className="text-sm font-semibold text-morandi-white mb-3">Stay in touch</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-clay-pink text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-clay-pink text-white px-5 py-2.5 rounded-lg font-medium hover:bg-clay-pink/90 transition-colors text-sm"
                >
                  Subscribe
                </button>
              </form>
              {isSubscribed && (
                <p className="text-soft-sage text-sm mt-2">Thank you for subscribing.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-morandi-white mb-4">Links</h4>
            <ul className="space-y-3 text-sm text-morandi-white/75">
              <li><Link href="/" className="hover:text-clay-pink transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-clay-pink transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-clay-pink transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-clay-pink transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-morandi-white/50">
          © {new Date().getFullYear()} Morandi Lifestyle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
