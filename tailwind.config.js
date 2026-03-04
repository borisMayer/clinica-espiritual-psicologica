/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f7f2',
          100: '#dcede2',
          500: '#4a7c59',
          600: '#3d6849',
          700: '#2f5238',
        },
        gold: '#c9a84c',
      },
      fontFamily: {
        serif: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [],
}
