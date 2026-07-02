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
          50: 'var(--m50)',
          100: 'var(--m100)',
          200: 'var(--m200)',
          300: 'var(--m300)',
          400: 'var(--m400)',
          500: 'var(--m500)',
          600: 'var(--m600)',
          700: 'var(--m700)',
          800: 'var(--m800)',
          900: 'var(--m900)',
          950: 'var(--m950)',
        },
        mystic: {
          gold: 'var(--accent)',
          lightgold: 'var(--accent-bright)',
          rose: '#e91e63',
          violet: 'var(--mviolet)',
          silver: 'var(--msilver)',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        title: ['"Cinzel"', '"Noto Serif SC"', 'serif'],
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
        'cosmic': 'linear-gradient(135deg, var(--m900) 0%, var(--m700) 50%, var(--m800) 100%)',
        'mystic-gold': 'linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 50%, var(--accent) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px var(--glow-rune), 0 0 60px rgba(212, 175, 55, 0.2)',
        'gold-glow-lg': '0 0 50px var(--glow-rune), 0 0 100px rgba(212, 175, 55, 0.3)',
        'inner-gold': 'inset 0 0 30px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
