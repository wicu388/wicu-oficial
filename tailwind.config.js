/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      // 🎨 COLORES WICU
      colors: {
        primary: "#00f5ff",
        dark: "#020617",
        card: "rgba(255,255,255,0.05)",
        neon: "#00f0ff",
        neonBlue: "#007cf0",
      },

      // 🌈 GRADIENTES
      backgroundImage: {
        "gradient-wicu": "linear-gradient(135deg, #000000, #020024, #090979)",
      },

      // 💡 SOMBRAS NEON
      boxShadow: {
        neon: "0 0 15px #00f0ff, 0 0 30px #00f0ff",
        soft: "0 10px 30px rgba(0,0,0,0.5)",
      },

      // 🔤 TIPOGRAFÍA PRO
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        futuristic: ["Orbitron", "sans-serif"],
      },

      // ⚡ ANIMACIONES
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 4s ease-in-out infinite",
        gradient: "gradientMove 10s ease infinite",
      },

      // 🎬 KEYFRAMES
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #00f0ff" },
          "100%": { boxShadow: "0 0 25px #00f0ff" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },

    },
  },
  plugins: [],
};