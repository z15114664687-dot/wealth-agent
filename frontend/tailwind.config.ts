import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        acid: '#CCFF00',
        electric: '#0033FF',
        punch: '#FF0055',
        cloud: '#F3F3EF',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
        display: ['Arial Black', 'Inter', 'sans-serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'hard-blue': '8px 8px 0px #0033FF',
        'hard-green': '8px 8px 0px #CCFF00',
        'hard-pink': '8px 8px 0px #FF0055',
      },
      backgroundImage: {
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
