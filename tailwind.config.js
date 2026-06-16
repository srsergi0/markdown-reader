/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,tsx,ts}", "./index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gray: {
          750: "#2d2d3a",
          850: "#1a1a2e",
        },
      },
    },
  },
  plugins: [],
};
