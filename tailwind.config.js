/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0D1B1E",
          900: "#12262A",
          800: "#173339",
          700: "#1E434B",
          600: "#28565F",
        },
        teal: {
          50: "#EEF6F5",
          100: "#D7EAE7",
          200: "#AFD5CF",
          300: "#7FB9B0",
          400: "#4F9D91",
          500: "#2F8478",
          600: "#246B62",
          700: "#1C544E",
        },
        amber: {
          50: "#FFF7EA",
          100: "#FEECC7",
          300: "#F7C874",
          400: "#F0AD3F",
          500: "#E8952A",
          600: "#C77A1E",
        },
        paper: "#F6F5F1",
        line: "#DEDCD3",
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
