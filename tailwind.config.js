/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6AF586",
        dark: "#0B0B0F"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)"
      },
      borderColor: {
        glass: "rgba(255,255,255,0.14)"
      },
      backgroundColor: {
        glass: "rgba(255,255,255,0.06)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
