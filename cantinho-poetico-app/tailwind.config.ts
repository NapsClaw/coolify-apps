import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azul: { DEFAULT: '#3b82f6', light: '#eff6ff', mid: '#bfdbfe', dark: '#1d4ed8' },
        verde: { DEFAULT: '#22c55e', light: '#f0fdf4', mid: '#bbf7d0', dark: '#15803d' },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
