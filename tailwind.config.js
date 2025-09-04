/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('./images/hero-bg.jpg')",
        'banner-pattern': "url('./images/hero-bg_1.jpg')",
      },
      colors: {
        'dark-blue': "#142951",
        'golden-yellow': "#FFB404"
      }
    },
  },
  plugins: [],
}

