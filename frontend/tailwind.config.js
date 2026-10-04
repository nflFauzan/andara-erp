/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f1e3d',
        },
        navy: {
          50: '#f0f4f9',
          100: '#dde6f2',
          200: '#bfd2e6',
          300: '#91b5d6',
          400: '#5d92c2',
          500: '#3974ab',
          600: '#285b8e',
          700: '#214973',
          800: '#1d3e5f',
          900: '#0f1e35',
          950: '#070e1c',
        },
        amber: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
        slate: {
          850: '#151f32',
          925: '#0b1324',
          950: '#070e1c',
        },
        neu: {
          canvas: 'var(--neu-canvas)',
          surface: 'var(--neu-surface)',
          hover: 'var(--neu-surface-hover)',
          border: 'var(--neu-border-hairline)',
          dark: 'var(--neu-shadow-dark)',
          light: 'var(--neu-shadow-light)',
          accent: 'var(--neu-accent)',
        }
      },
      boxShadow: {
        'bento': '0 1px 3px rgba(15, 30, 60, 0.05), 0 10px 30px rgba(15, 30, 60, 0.07)',
        'bento-hover': '0 4px 10px rgba(15, 30, 60, 0.08), 0 20px 40px rgba(15, 30, 60, 0.12)',
        'bento-dark': '0 1px 3px rgba(0, 0, 0, 0.35), 0 10px 30px rgba(0, 0, 0, 0.45)',
        'glow-blue': '0 0 24px rgba(59, 130, 246, 0.25)',
        'glow-soft': '0 0 16px rgba(147, 197, 253, 0.35)',
        // Neumorphic Soft UI Shadows
        'neu-convex-xs': '2px 2px 5px var(--neu-shadow-dark), -2px -2px 5px var(--neu-shadow-light)',
        'neu-convex-sm': '4px 4px 10px var(--neu-shadow-dark), -4px -4px 10px var(--neu-shadow-light)',
        'neu-convex-md': '7px 7px 16px var(--neu-shadow-dark), -7px -7px 16px var(--neu-shadow-light)',
        'neu-convex-lg': '12px 12px 24px var(--neu-shadow-dark), -12px -12px 24px var(--neu-shadow-light)',
        'neu-inset-xs': 'inset 1.5px 1.5px 3px var(--neu-shadow-dark), inset -1.5px -1.5px 3px var(--neu-shadow-light)',
        'neu-inset-sm': 'inset 2.5px 2.5px 6px var(--neu-shadow-dark), inset -2.5px -2.5px 6px var(--neu-shadow-light)',
        'neu-inset-md': 'inset 4px 4px 9px var(--neu-shadow-dark), inset -4px -4px 9px var(--neu-shadow-light)',
        'neu-inset-deep': 'inset 6px 6px 14px var(--neu-shadow-dark), inset -6px -6px 14px var(--neu-shadow-light)',
        'neu-accent': '4px 4px 14px rgba(37, 99, 235, 0.35), -2px -2px 8px rgba(255, 255, 255, 0.6)',
        'neu-accent-inset': 'inset 3px 3px 6px rgba(29, 78, 216, 0.5), inset -3px -3px 6px rgba(147, 197, 253, 0.3)',
        'neu-pressed': 'inset 3px 3px 7px var(--neu-shadow-dark), inset -3px -3px 7px var(--neu-shadow-light)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
