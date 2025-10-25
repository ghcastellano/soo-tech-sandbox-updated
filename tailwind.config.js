/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./app/**/*.tsx",
    "./components/**/*.tsx",
    "./pages/**/*.tsx",
    "./src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6AF586",
        dark: "#0B0B0F",
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
};
