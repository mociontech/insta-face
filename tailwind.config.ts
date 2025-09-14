/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamil: {
        oracle:['var(--font-oracle))']
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        secundary: "var(--secundary)",
      },
    },
  },
  plugins: [],
};
