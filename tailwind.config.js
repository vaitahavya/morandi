/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Morandi Brand Colors
        'earthy-beige': '#EAE4DC',
        'soft-sage': '#B7C4B2',
        'clay-pink': '#D6A8A0',
        'deep-charcoal': '#333333',
        'morandi-white': '#FFFFFF',
        // Legacy primary colors (keeping for compatibility)
        primary: {
          50: '#fff7f2',
          100: '#feeee7',
          200: '#fcd9ce',
          300: '#fbc2b3',
          400: '#f9ad99',
          500: '#f7947c',
          600: '#e27863',
          700: '#bf5e4c',
          800: '#9d4737',
          900: '#7b3324',
        },
      },
      fontFamily: {
        'serif': ['var(--font-serif)', 'Playfair Display', 'serif'], // Elegant Serif for headings
        'sans': ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'], // Clean Sans for body text
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
