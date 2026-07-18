/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF5A36',
          50: '#FFF1EE',
          100: '#FFE1D9',
          500: '#FF5A36',
          600: '#E8452A',
        },
        ink: '#141414',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
