/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#080D1A',
        darkCard: '#0E172C',
        darkSurface: '#142038',
        darkBorder: '#1E2D4A',
        navy: {
          950: '#04070F',
          900: '#080D1A',
          850: '#0B1222',
          800: '#0E172C',
          700: '#15233E',
          600: '#1E3258',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#8FA1BA',
          500: '#64748B',
          600: '#475569',
          700: '#1E2D4A', // refined cyber-dark borders
          750: '#142038', // sleek inputs & inner chips
          800: '#0E172C', // primary midnight dark cards & panels
          850: '#0B1222', // elevated backdrop
          900: '#080D1A', // deep page midnight background
          925: '#060A14',
          950: '#04070F',
        },
        medical: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#052238',
        },
        tealAccent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'card': '0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 25px rgba(14, 165, 233, 0.3)',
        'glow-teal': '0 0 25px rgba(20, 184, 166, 0.3)',
        'dark-inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      }
    },
  },
  plugins: [],
}
