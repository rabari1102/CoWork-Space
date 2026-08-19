/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae4ff',
          200: '#bccfff',
          500: '#4f6bed',
          600: '#3a52d4',
          700: '#2f42ab',
          900: '#1f2a63',
        },
      },
    },
  },
  plugins: [],
};
