/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // علشان نقدر نضيف dark mode عن طريق class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
