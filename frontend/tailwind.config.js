import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Taken from the logo: deep navy shell, teal mark.
        navy: {
          50: '#f4f6fa',
          100: '#e6ebf3',
          200: '#c8d3e5',
          700: '#1e3157',
          800: '#16243f',
          900: '#101b30',
          950: '#0b1220',
        },
        brand: {
          50: '#ecfdf9',
          100: '#d0f7ef',
          200: '#a3efe1',
          300: '#6ee2d0',
          400: '#3acdba',
          500: '#23b5a6',
          600: '#159487',
          700: '#12766d',
          800: '#135e58',
          900: '#134e4a',
        },
      },
      fontSize: {
        // Editorial display sizes for the hero and section headings.
        display: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
        section: ['clamp(1.875rem, 3.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgb(16 27 48 / 0.08), 0 1px 2px -1px rgb(16 27 48 / 0.06)',
        card: '0 4px 16px -4px rgb(16 27 48 / 0.10), 0 2px 6px -2px rgb(16 27 48 / 0.06)',
        lift: '0 18px 40px -12px rgb(16 27 48 / 0.22), 0 8px 16px -8px rgb(16 27 48 / 0.12)',
        modal: '0 24px 48px -12px rgb(11 18 32 / 0.25), 0 8px 16px -8px rgb(11 18 32 / 0.15)',
        glow: '0 0 0 1px rgb(35 181 166 / 0.25), 0 8px 30px -6px rgb(35 181 166 / 0.35)',
      },
      backgroundImage: {
        'grid-navy':
          'linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [forms],
};
