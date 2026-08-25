/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LevelShift palette — driven by CSS variables (see app.css) so the
        // same class names work for both dark (default) and light themes.
        // Values are stored as space-separated RGB channels so Tailwind's
        // opacity modifiers (e.g. bg-accent-blue/20) keep working.
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',   // deepest background
          1: 'rgb(var(--surface-1) / <alpha-value>)',   // card background
          2: 'rgb(var(--surface-2) / <alpha-value>)',   // elevated surface
          3: 'rgb(var(--surface-3) / <alpha-value>)',   // borders, dividers
        },
        accent: {
          blue: 'rgb(var(--accent-blue) / <alpha-value>)',
          green: 'rgb(var(--accent-green) / <alpha-value>)',
          red: 'rgb(var(--accent-red) / <alpha-value>)',
          yellow: 'rgb(var(--accent-yellow) / <alpha-value>)',
          purple: 'rgb(var(--accent-purple) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'pulse-green': 'pulseGreen 0.6s ease-out',
        'shake': 'shake 0.4s ease-out',
        'fly-away': 'flyAway 0.5s ease-in forwards',
        'xp-tick': 'xpTick 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%': { boxShadow: '0 0 0 0 rgba(63, 185, 80, 0.7)' },
          '100%': { boxShadow: '0 0 0 12px rgba(63, 185, 80, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        flyAway: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(100vw) scale(0.5)', opacity: '0' },
        },
        xpTick: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      }
    }
  },
  plugins: []
};
