'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with your email service (Mailchimp, ConvertKit, etc.)
    console.log('Newsletter signup:', email);
    setIsSubscribed(true);
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <section className="bg-primary-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-primary-800">Thank you!</h2>
          <p className="text-primary-600">You've been successfully subscribed to our newsletter.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary-50 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-primary-800">Stay Updated</h2>
          <p className="mb-8 text-primary-600">
            Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips.
          </p>
          
          <form onSubmit={handleSubmit} className="mx-auto max-w-md">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 rounded-md border border-primary-200 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="rounded-md bg-primary-600 px-6 py-2 text-white transition-colors hover:bg-primary-700"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
} 