import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* McLaren F1 Inspired Palette */
        /* Core - Soft Black */
        background: "#0A0A0A",
        "background-elevated": "#111111",
        foreground: "#F8F4F0",
        "foreground-muted": "#888888",
        
        /* Surface */
        card: "#0F0F0F",
        "card-hover": "#1A1A1A",
        muted: "#1F1F1F",
        "muted-hover": "#2A2A2A",
        border: "#1F1F1F",
        "border-subtle": "#171717",
        
        /* Primary - Papaya Orange */
        accent: "#FF8000",
        "accent-hover": "#E67300",
        "accent-pressed": "#CC6600",
        "accent-subtle": "#FF8000",
        "accent-foreground": "#0A0A0A",
        
        /* Secondary - Racing Blue */
        teal: "#0057B8",
        "teal-hover": "#004494",
        "teal-subtle": "#0057B8",
        "teal-foreground": "#FFFFFF",
        
        /* Semantic */
        success: "#22C55E",
        "success-subtle": "#22C55E",
        warning: "#FF8000",
        "warning-subtle": "#FF8000",
        error: "#EF4444",
        "error-subtle": "#EF4444",
        info: "#0057B8",
        "info-subtle": "#0057B8",
        
        /* Interaction */
        ring: "#FF8000",
        
        /* McLaren brand colors */
        papaya: {
          DEFAULT: "#FF8000",
          light: "#FF9020",
          dark: "#E67300",
        },
        racing: {
          blue: "#0057B8",
          "blue-light": "#0066CC",
          "blue-dark": "#004494",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        oughter: ["var(--font-oughter)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.5)",
        "glass-hover": "0 12px 48px rgba(0, 0, 0, 0.55)",
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
      },
    },
  },
  plugins: [],
};

export default config;
