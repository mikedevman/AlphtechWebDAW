/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sonar: {
          bg: '#111318',
          panel: '#191c24',
          panelLight: '#232732',
          panelBorder: '#2d3342',
          borderSubtle: '#1f242e',
          accent: '#38bdf8', // Sonar Blue
          accentGlow: 'rgba(56, 189, 248, 0.4)',
          amber: '#f59e0b',  // Tube Preamp
          amberGlow: 'rgba(245, 158, 11, 0.4)',
          ledGreen: '#10b981',
          ledRed: '#ef4444',
          ledYellow: '#facc15',
          echoOrange: '#f97316',
          trackBg: '#151820',
          trackHeader: '#1e222d',
          gridLine: '#262c3a'
        }
      },
      boxShadow: {
        'sonar-glow': '0 0 15px rgba(56, 189, 248, 0.35)',
        'tube-glow': '0 0 20px rgba(245, 158, 11, 0.45)',
        'btn-active': 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
