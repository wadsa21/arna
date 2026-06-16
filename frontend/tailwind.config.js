/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F5F5F5",
        secondary: "#D4D4D4",
        accent1: "#A3A3A3",
        accent2: "#FAFAFA",
        accent3: "#737373",
        accent4: "#FFFFFF",
        background: "#050505",
        surface: "#0D0D0D",
        surface2: "#171717",
        "text-primary": "#F5F5F5",
        "text-secondary": "#A3A3A3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "8px",
        "2xl": "8px",
        "3xl": "10px",
      },
      boxShadow: {
        "neon-primary": "0 18px 48px -28px rgba(255,255,255,0.5)",
        "neon-secondary": "0 18px 48px -28px rgba(255,255,255,0.35)",
        "neon-accent1": "0 18px 48px -28px rgba(255,255,255,0.3)",
        "neon-accent2": "0 18px 48px -28px rgba(255,255,255,0.3)",
        glass: "0 24px 70px -40px rgba(0,0,0,0.9)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #FFFFFF 0%, #D4D4D4 100%)",
        "gradient-warm": "linear-gradient(135deg, #F5F5F5 0%, #737373 100%)",
        "gradient-cool": "linear-gradient(135deg, #E5E5E5 0%, #737373 100%)",
      },
      keyframes: {
        blob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-50px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(0.9)" },
        },
        "gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 1px rgba(255,255,255,0.12)" },
          "50%": { boxShadow: "0 0 0 1px rgba(255,255,255,0.28)" },
        },
      },
      animation: {
        blob: "blob 12s infinite ease-in-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
