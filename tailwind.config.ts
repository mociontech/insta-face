/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        oracle: ['var(--font-oracle)'],
        loruner: ['var(--font-loruner)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secundary: "var(--secundary)",
      },
      animation: {
        'spin-sync': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
