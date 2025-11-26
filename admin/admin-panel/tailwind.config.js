/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2F5EAC",
        panel: "#0f172a",
        chip: "#EAF2FF",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
