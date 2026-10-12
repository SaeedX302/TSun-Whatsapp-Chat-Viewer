/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './*.tsx',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto Flex', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Material Design 3-ish tokens used across the app.
        primary: {
          DEFAULT: '#00a884',
          50: '#e7f8f3',
          100: '#c6efe3',
          200: '#8fdfc8',
          300: '#58cfa9',
          400: '#21bf8b',
          500: '#00a884',
          600: '#008a6c',
          700: '#006b54',
          800: '#004d3c',
          900: '#003025',
        },
        accent: {
          DEFAULT: '#0b93f6',
          light: '#4fb3ff',
          dark: '#0369a1',
        },
        surface: {
          light: '#fdfcfb',
          dim: '#f3f1ee',
          dark: '#0f1512',
          'dark-dim': '#080d0b',
        },
      },
      boxShadow: {
        'm3-1': '0 1px 2px 0 rgba(0,0,0,0.18), 0 1px 3px 1px rgba(0,0,0,0.10)',
        'm3-2': '0 1px 2px 0 rgba(0,0,0,0.18), 0 2px 6px 2px rgba(0,0,0,0.12)',
        'm3-3': '0 4px 8px 3px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.20)',
      },
      transitionTimingFunction: {
        m3: 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'm3-decelerate': 'cubic-bezier(0, 0, 0, 1)',
      },
      keyframes: {
        'fade-in-scale': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'snack-in': {
          from: { opacity: '0', transform: 'translateY(150%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.22s cubic-bezier(0.2, 0, 0, 1) both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.05, 0.7, 0.1, 1) both',
        'snack-in': 'snack-in 0.28s cubic-bezier(0, 0, 0, 1) both',
        'pop-in': 'pop-in 0.2s cubic-bezier(0.2, 0, 0, 1) both',
      },
    },
  },
  plugins: [],
};
