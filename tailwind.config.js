/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        midnight: {
          50: '#f5f3ff',
          100: '#e8e4f3',
          200: '#c4b8d8',
          300: '#9a82bf',
          400: '#6e4ea3',
          500: '#4a2d7c',
          600: '#2e1a5c',
          700: '#1a0f3d',
          800: '#0f0828',
          900: '#0a0824',
          950: '#050314',
        },
        mystic: {
          gold: '#d4af37',
          lightgold: '#f4d03f',
          rose: '#e91e63',
          violet: '#9b59b6',
          silver: '#c0c0d6',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        title: ['"Cinzel"', 'serif'],
        body: ['"Cormorant Garamond"', '"Noto Serif SC"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 40s linear infinite',
        'spin-reverse': 'spin 30s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'breathing': 'breathing 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'cosmic': 'linear-gradient(135deg, #0a0824 0%, #1a0f3d 50%, #0f0828 100%)',
        'mystic-gold': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
        'gold-glow-lg': '0 0 50px rgba(212, 175, 55, 0.6), 0 0 100px rgba(212, 175, 55, 0.3)',
        'inner-gold': 'inset 0 0 30px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
