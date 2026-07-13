/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        doodle: {
          pink: '#ff9ebd',
          blue: '#85d1fb',
          yellow: '#fcf195',
          purple: '#c6bcf6',
          mint: '#b6f0e4',
          bg: '#faf8f5',
          dark: '#1a1a1a'
        }
      },
      fontFamily: {
        sans: ['"Comic Sans MS"', '"Nunito"', 'sans-serif'], // Playful fonts
        display: ['"Fredoka One"', '"Nunito"', 'sans-serif']
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(26,26,26,1)',
        'brutal-lg': '8px 8px 0px 0px rgba(26,26,26,1)',
      }
    },
  },
  plugins: [],
}
