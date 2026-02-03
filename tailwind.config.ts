import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Electric Cyan + Deep Violet Palette */
        /* Core - Rich Black */
        background: "#0A0A0A",
        "background-elevated": "#111111",
        foreground: "#F8F8F8",
        "foreground-muted": "#888888",
        
        /* Surface */
        card: "#0F0F0F",
        "card-hover": "#1A1A1A",
        muted: "#1F1F1F",
        "muted-hover": "#2A2A2A",
        border: "#1F1F1F",
        "border-subtle": "#171717",
        
        /* Primary - Electric Cyan */
        accent: "#00D4FF",
        "accent-hover": "#00E5FF",
        "accent-pressed": "#00BFFF",
        "accent-subtle": "#00D4FF",
        "accent-foreground": "#0A0A0A",
        
        /* Secondary - Deep Violet */
        teal: "#7C3AED",
        "teal-hover": "#8B5CF6",
        "teal-subtle": "#7C3AED",
        "teal-foreground": "#FFFFFF",
        
        /* Semantic */
        success: "#10B981",
        "success-subtle": "#10B981",
        warning: "#F59E0B",
        "warning-subtle": "#F59E0B",
        error: "#EF4444",
        "error-subtle": "#EF4444",
        info: "#00D4FF",
        "info-subtle": "#00D4FF",
        
        /* Interaction */
        ring: "#00D4FF",
        
        /* Brand colors */
        cyan: {
          DEFAULT: "#00D4FF",
          light: "#4DE8FF",
          dark: "#00BFFF",
        },
        violet: {
          DEFAULT: "#7C3AED",
          light: "#8B5CF6",
          dark: "#6D28D9",
        },
      },
      fontFamily: {
        /* Consolidated Typography - 2 font families only */
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Syne", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        /* Fluid typography scale */
        "display-xl": ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.5rem, 3vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4" }],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.55)",
        md: "0 4px 8px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
        lg: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 4px 8px -6px rgba(0, 0, 0, 0.45)",
        xl: "0 18px 30px -10px rgba(0, 0, 0, 0.65), 0 8px 12px -4px rgba(0, 0, 0, 0.45)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.5)",
        "glass-hover": "0 12px 48px rgba(0, 0, 0, 0.55)",
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)",
        "glow-violet": "0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2)",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        "13": "3.25rem",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out",
        "fade-out": "fadeOut 200ms ease-in",
        "slide-up": "slideUp 300ms ease-out",
        "slide-down": "slideDown 300ms ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 212, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
