import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C5A059',
          hover: '#B38E46',
          light: '#E8CE87',
          dark: '#8F6E2A',
        },
        secondary: '#121214',
        background: '#0C0C0E',
        surface: '#141418',
        card: '#1A1A20',
        text: '#F5F5F7',
        gold: {
          DEFAULT: '#C5A059',
          50: '#FBF8F0',
          100: '#F7F0DC',
          200: '#EEDDAA',
          300: '#E5C975',
          400: '#DDB64B',
          500: '#C5A059',
          600: '#A8823E',
          700: '#85642B',
          800: '#5E441B',
          900: '#3D2C11',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
