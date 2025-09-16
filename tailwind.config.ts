/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        title: ['var(--font-title)', ...fontFamily.sans],
        subtitle: ['var(--font-subtitle)', ...fontFamily.sans],
        body: ['var(--font-body)', ...fontFamily.sans],
      },
      animation: {
        'spin-sync': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
