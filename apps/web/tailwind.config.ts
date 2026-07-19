import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted-foreground)",
        "muted-surface": "var(--muted)",
        border: "var(--border)",
        ring: "var(--ring)",
        info: "var(--info)",
        destructive: "var(--destructive)",
        ink: "var(--background)",
        surface: "var(--card)",
        signal: "var(--info)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius-md)",
        md: "var(--radius-sm)",
        sm: "var(--radius-xs)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
