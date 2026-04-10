/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        forest: {
          50:  '#f0f7f2',
          100: '#d9ede0',
          200: '#b3dbc2',
          300: '#7fc29a',
          400: '#4da472',
          500: '#2d5a3d',
          600: '#245031',
          700: '#1c4028',
          800: '#153020',
          900: '#0e2116',
        },
        parchment: {
          50:  '#fafaf7',
          100: '#f7f6f2',
          200: '#f0efe9',
          300: '#e8e7e0',
          400: '#d4d3c8',
          500: '#b8b7aa',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%,100%': { opacity: 0.4 }, '50%': { opacity: 1 } },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 6px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.1)',
        'green-glow': '0 0 40px rgba(45,90,61,0.2)',
      },
    },
  },
  plugins: [],
}
