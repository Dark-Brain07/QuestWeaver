/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quest: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#8b5cf6',
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          success: '#10b981',
          gold: '#fbbf24'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif']
      }
    },
  },
  plugins: [],
}
