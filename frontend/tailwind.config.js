/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // MediNexus design tokens — a clinical, trustworthy palette,
        // deliberately not a generic SaaS blue/purple gradient kit.
        ink: '#0F1A24', // near-black, used for primary text (not pure #000/#111)
        clinical: {
          50: '#EFF6F5',
          100: '#D9EBE8',
          200: '#CFE7E3',
          300: '#A9D1CC',
          400: '#3E8E86',
          500: '#1F6E66', // primary brand teal — evokes clinical/medical trust
          600: '#175A53',
          700: '#0F433E',
        },
        urgent: {
          100: '#FCE8E6',
          500: '#C4432E', // used only for HIGH risk / emergency indicators
        },
        caution: {
          100: '#FDF3E1',
          500: '#B8791A', // used for MEDIUM risk indicators
        },
        stable: {
          100: '#EAF3E7',
          500: '#3F7D3A', // used for LOW risk indicators
        },
        surface: '#F7F8F6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Manrope"', '"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
