import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E2136E",
          light: "#ff4d8c",
          dark: "#b80d54",
        },
        cream: {
          DEFAULT: "#FFF9F5",
          dark: "#F5EDE6",
        },
        paper: "#FDF6F0",
      },
      fontFamily: {
        bangla: ["var(--font-hind-siliguri)", "sans-serif"],
        sans: ["var(--font-hind-siliguri)", "var(--font-poppins)", "sans-serif"],
      },
      animation: {
        "envelope-flutter": "envelope-flutter 0.4s ease-in-out",
        "letter-reveal": "letter-reveal 1s ease-out forwards",
        "amount-pop": "amount-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      keyframes: {
        "envelope-flutter": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.02) rotate(-1deg)" },
        },
        "letter-reveal": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "amount-pop": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
