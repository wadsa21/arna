/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // индиго/фиолетовый
        secondary: "#8B5CF6", // пурпурный
        accent1: "#06B6D4", // циан
        accent2: "#10B981", // изумрудный
        accent3: "#F59E0B", // янтарный
        accent4: "#EF4444", // красный (алерты)
        background: "#0F0F1A", // тёмно-синий почти чёрный
        surface: "#1A1A2E",
        surface2: "#16213E",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        "neon-primary": "0 0 24px -2px rgba(99,102,241,0.55)",
        "neon-secondary": "0 0 24px -2px rgba(139,92,246,0.55)",
        "neon-accent1": "0 0 24px -2px rgba(6,182,212,0.55)",
        "neon-accent2": "0 0 24px -2px rgba(16,185,129,0.55)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.37)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
        "gradient-warm": "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
        "gradient-cool": "linear-gradient(135deg, #06B6D4 0%, #10B981 100%)",
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
          "0%,100%": { boxShadow: "0 0 20px -4px rgba(99,102,241,0.5)" },
          "50%": { boxShadow: "0 0 40px 0 rgba(139,92,246,0.7)" },
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
