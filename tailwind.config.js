
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        earthy: "#914F37",
        sand: "#EDE8DD",
        ink: "#111111",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wide2: ".02em",
      }
    }
  },
  plugins: []
}
