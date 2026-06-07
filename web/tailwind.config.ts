import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // tokens via CSS vars (trocam entre claro/escuro) — ver index.css
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3) / <alpha-value>)",
        ink: "rgb(var(--text) / <alpha-value>)",
        "ink-2": "rgb(var(--text-2) / <alpha-value>)",
        "ink-3": "rgb(var(--text-3) / <alpha-value>)",
        line: "rgb(var(--border) / <alpha-value>)",
        // marca (igual nos dois temas)
        heat: { 1: "#FF1E56", 2: "#FF5E3A", 3: "#FFB020" },
        super: "#FFC23C",
        verified: "#FFB020",
        violet: "#9B5CFF",
      },
      backgroundImage: {
        heat: "linear-gradient(135deg, #FF1E56 0%, #FF5E3A 55%, #FFB020 100%)",
      },
      borderRadius: { sm: "12px", md: "20px", lg: "28px" },
      boxShadow: {
        card: "0 12px 40px rgb(var(--shadow) / 0.12)",
        glow: "0 8px 32px rgba(255,46,86,0.35)",
      },
      fontFamily: {
        display: ['"Clash Display"', "system-ui", "sans-serif"],
        sans: ['"Satoshi"', "Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        firepop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.4) rotate(-8deg)" },
          "70%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        spark: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-28px) scale(0)", opacity: "0" },
        },
      },
      animation: {
        firepop: "firepop 0.55s ease-out",
        spark: "spark 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
