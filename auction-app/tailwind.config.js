/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        auction: {
          gold: '#FFD700',
          red: '#D32F2F',
          dark: '#121212',
          surface: '#1E1E1E',
          highlight: '#FFC107',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Simplified for now, can add specific fonts later
      }
    },
  },
  plugins: [],
}
