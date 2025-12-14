/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        jet: {
          DEFAULT: "#18181B",
        },
        emerald: {
          DEFAULT: "#059669",
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
        },
        silver: {
          DEFAULT: "#E2E8F0",
        },
        purewhite: {
          DEFAULT: "#FFFFFF",
        },
        darkgrey: {
          DEFAULT: "#334155",
        },
      },
    },
  },
  plugins: [],
};
