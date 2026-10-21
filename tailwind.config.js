/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#CCFF00",
        theme: {
          page: "var(--bg-page)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          contrast: "var(--bg-surface-contrast)",
          border: "var(--border-subtle)",
          "border-strong": "var(--border-strong)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverted: "var(--text-inverted)",
        },
      },
      fontFamily: { display: ["Inter", "Helvetica Neue", "Arial", "sans-serif"] },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: { to: { transform: "translateX(-50%)" } },
      },
      animation: { shimmer: "shimmer 2s infinite", marquee: "marquee 25s linear infinite" },
    },
  },
  plugins: [],
};
