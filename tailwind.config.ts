import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Core */
        background: "hsl(var(--color-bg))",
        "background-elevated": "hsl(var(--color-bg-elevated))",
        foreground: "hsl(var(--color-fg))",
        "foreground-muted": "hsl(var(--color-fg-muted))",
        
        /* Surface */
        card: "hsl(var(--color-card))",
        "card-hover": "hsl(var(--color-card-hover))",
        muted: "hsl(var(--color-muted))",
        "muted-hover": "hsl(var(--color-muted-hover))",
        border: "hsl(var(--color-border))",
        "border-subtle": "hsl(var(--color-border-subtle))",
        
        /* Primary - Papaya Orange */
        accent: "hsl(var(--color-accent))",
        "accent-hover": "hsl(var(--color-accent-hover))",
        "accent-pressed": "hsl(var(--color-accent-pressed))",
        "accent-subtle": "hsl(var(--color-accent-subtle))",
        "accent-foreground": "hsl(var(--color-accent-foreground))",
        
        /* Secondary - Teal */
        teal: "hsl(var(--color-teal))",
        "teal-hover": "hsl(var(--color-teal-hover))",
        "teal-subtle": "hsl(var(--color-teal-subtle))",
        "teal-foreground": "hsl(var(--color-teal-foreground))",
        
        /* Semantic */
        success: "hsl(var(--color-success))",
        "success-subtle": "hsl(var(--color-success-subtle))",
        warning: "hsl(var(--color-warning))",
        "warning-subtle": "hsl(var(--color-warning-subtle))",
        error: "hsl(var(--color-error))",
        "error-subtle": "hsl(var(--color-error-subtle))",
        info: "hsl(var(--color-info))",
        "info-subtle": "hsl(var(--color-info-subtle))",
        
        /* Interaction */
        ring: "hsl(var(--color-ring))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        display: ["var(--font-oughter)", "var(--font-serif)", "serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "glow-accent": "var(--shadow-glow-accent)",
        "glow-teal": "var(--shadow-glow-teal)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 200ms ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
