import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Panel colors - Red theme
        panel: {
          DEFAULT: "#FF0000", // Red color for bg-panel
          foreground: "#ffffff", // White text on red
        },
        
        // Core system colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Primary colors - Blue theme (currently used)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Sidebar colors
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Legacy CoConsultants colors (teal theme)
        coconsultants: {
          teal: "#6ABCC1",
          dark: "#3F3F3F",
          light: "#F6F6F7",
          accent: "#C8C8C9",
          muted: "#F1F1F1",
        },

        // Construction theme colors
        construction: {
          grey: "hsl(var(--construction-grey))",
          "light-grey": "hsl(var(--construction-light-grey))",
        },

        // Admin-specific colors
        admin: {
          primary: {
            DEFAULT: "hsl(var(--admin-primary))",
            foreground: "hsl(var(--admin-primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--admin-secondary))",
            foreground: "hsl(var(--admin-secondary-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--admin-accent))",
            foreground: "hsl(var(--admin-accent-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--admin-destructive))",
            foreground: "hsl(var(--admin-destructive-foreground))",
          },
          success: "hsl(var(--admin-success))",
          warning: "hsl(var(--admin-warning))",
          info: "hsl(var(--admin-info))",
          gray: "hsl(var(--admin-gray))",
        },
      },

      // Spacing utilities
      spacing: {
        18: "4.5rem",
        88: "22rem",
        120: "30rem",
      },

      // Background gradients
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-cta": "var(--gradient-cta)",
      },

      // Shadow utilities
      boxShadow: {
        elegant: "0 10px 30px -10px hsl(185 42% 58% / 0.3)",
        soft: "0 2px 10px -2px hsl(0 0% 0% / 0.1)",
        professional: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "professional-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "professional-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },

      // Border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Typography
      fontFamily: {
        space: ["Space Grotesk", "sans-serif"],
      },

      // Animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "scale-in-out": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "scale-in-out": "scale-in-out 3s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;