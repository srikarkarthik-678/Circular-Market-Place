/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ["Poppins", "sans-serif"],
        bat: ["Momo Trust Display", "sans-serif"],
      },
      colors:{
        'beige': '#F5F5DC'
      }
    },
  },
  plugins: [],
}
