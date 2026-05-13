const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans Thai Variable'", "Mitr", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        brand: {
          red: "var(--color-brand-red)",
          "orange-red": "var(--color-brand-orange-red)",
          "pink-red": "var(--color-brand-pink-red)",
          start: "var(--color-brand-red)",
          mid: "var(--color-brand-orange-red)",
          end: "var(--color-brand-pink-red)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-text)",
        card: {
          DEFAULT: "var(--color-background-card)",
          foreground: "var(--color-text)",
        },
        muted: {
          DEFAULT: "var(--color-background-offset)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-brand-red)",
          foreground: "var(--color-text)",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        input: "var(--color-border)",
        ring: "var(--color-brand-red)",
        border: "var(--color-border)",
      },
      textColor: {
        default: "var(--color-text)",
        offset: "var(--color-text-muted)",
        muted: "var(--color-text-muted)",
      },
      backgroundColor: {
        default: "var(--color-background)",
        offset: "var(--color-background-offset)",
        card: "var(--color-background-card)",
      },
      borderColor: {
        default: "var(--color-border)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      animation: {
        "text-slide": "text-slide 12.5s cubic-bezier(0.83, 0, 0.17, 1) infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "text-slide": {
          "0%, 16%": { transform: "translateY(0%)" },
          "20%, 36%": { transform: "translateY(-16.66%)" },
          "40%, 56%": { transform: "translateY(-33.33%)" },
          "60%, 76%": { transform: "translateY(-50%)" },
          "80%, 96%": { transform: "translateY(-66.66%)" },
          "100%": { transform: "translateY(-83.33%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  corePlugins: {
    fontSize: false,
  },
  plugins: [require("tailwindcss-fluid-type")],
};
