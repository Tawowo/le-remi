import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Tapis de jeu
        felt: {
          DEFAULT: "#0f2e24",
          light: "#1b4638",
          deep: "#0a2019",
        },
        ivory: "#f6f1e3",
        gold: {
          DEFAULT: "#d4af37",
          soft: "#e8c45a",
          deep: "#b8912a",
        },
        contre: "#9b1c1c",
        card: {
          face: "#faf6ec",
          edge: "#d8cfba",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 18px -4px rgba(0,0,0,0.5)",
        glow: "0 0 24px rgba(212,175,55,0.45)",
      },
      keyframes: {
        "flip-in": {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        "deal-in": {
          "0%": { transform: "translateY(-120%) rotate(-12deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(0) scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(30%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-30%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pop-gold": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fan-out": {
          "0%": { transform: "rotate(0) translateX(0)", opacity: "0" },
          "100%": { transform: "var(--fan-transform)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "flip-in": "flip-in 0.5s cubic-bezier(0.2,0.8,0.2,1) both",
        "deal-in": "deal-in 0.5s cubic-bezier(0.2,0.8,0.2,1) both",
        "slide-in-right": "slide-in-right 0.35s ease-out both",
        "slide-in-left": "slide-in-left 0.35s ease-out both",
        "pop-gold": "pop-gold 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
        "fan-out": "fan-out 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
