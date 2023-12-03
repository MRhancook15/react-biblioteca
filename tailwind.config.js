/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "bg-fond-book": "url('./src/images/bg_register_book.jpg')",
      },
      dropShadow: {
        '3xl': '15px 25px 5px rgba(0, 0, 0, 0.75)',
      }
    },
  },
  plugins: [],
};
