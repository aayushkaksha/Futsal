export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // Deep blue
        secondary: "#10B981", // Emerald green
        accent: "#F59E0B", // Amber
        background: "#F3F4F6", // Light gray
        text: "#1F2937", // Dark gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 