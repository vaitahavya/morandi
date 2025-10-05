'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    phone: '',
    preferences: {
      newsletter: true,
      marketing: false,
      productUpdates: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Update session with new data
        await update();
        toast.success('Welcome to Morandi Lifestyle!');
        router.push('/account');
      } else {
        toast.error('Failed to complete onboarding');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome to Morandi Lifestyle!
            </h1>
            <p className="mt-2 text-gray-600">
              Let's set up your account to get you started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Communication Preferences
                </legend>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center">
                    <input
                      id="newsletter"
                      type="checkbox"
                      checked={formData.preferences.newsletter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            newsletter: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                      Subscribe to our newsletter for updates and tips
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="marketing"
                      type="checkbox"
                      checked={formData.preferences.marketing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            marketing: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="marketing" className="ml-2 text-sm text-gray-700">
                      Receive marketing emails and special offers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="productUpdates"
                      type="checkbox"
                      checked={formData.preferences.productUpdates}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            productUpdates: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="productUpdates" className="ml-2 text-sm text-gray-700">
                      Get notified about new product launches
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/account')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
