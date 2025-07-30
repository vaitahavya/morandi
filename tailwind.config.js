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
    },
  },
  plugins: [],
};
