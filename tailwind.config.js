/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        daw: {
          darkest: '#0d0f12',
          dark: '#14171d',
          panel: '#1b2028',
          border: '#2a313d',
          muted: '#526075',
          accent: '#ff8400', // Preamp Tube Amber
          accentGlow: 'rgba(255, 132, 0, 0.4)',
          ledGreen: '#00e676',
          ledRed: '#ff1744',
          ledYellow: '#ffea00',
          track: '#1e2430'
        }
      },
      boxShadow: {
        'tube-glow': '0 0 20px rgba(255, 132, 0, 0.45)',
        'tube-intense': '0 0 35px rgba(255, 132, 0, 0.7)',
        'led-glow': '0 0 10px rgba(0, 230, 118, 0.6)',
      }
    },
  },
  plugins: [],
}
