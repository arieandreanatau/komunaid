import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        navy: {
          DEFAULT: '#0A1D4D',
          50: '#E8EBF3',
          100: '#C5CCE3',
          200: '#9EABC9',
          300: '#7084AB',
          400: '#4A6393',
          500: '#1D4ED8',
          600: '#1A3A9E',
          700: '#0A1D4D',
          800: '#081638',
          900: '#040B1D',
        },
        royal: {
          DEFAULT: '#1D4ED8',
          50: '#EBF0FD',
          100: '#D1DEF9',
          200: '#A3BDF3',
          300: '#759CED',
          400: '#477BE7',
          500: '#1D4ED8',
          600: '#1740B5',
          700: '#113192',
          800: '#0B226F',
          900: '#05134C',
        },
        teal: {
          DEFAULT: '#11A79B',
          50: '#E6F7F6',
          100: '#C0ECE9',
          200: '#81D9D3',
          300: '#42C6BD',
          400: '#1BB8AF',
          500: '#11A79B',
          600: '#0E8A80',
          700: '#0B6D65',
          800: '#08504A',
          900: '#053330',
        },
        aqua: {
          DEFAULT: '#00C8E6',
          50: '#E6F9FC',
          100: '#C0F0F8',
          200: '#81E1F1',
          300: '#42D2EA',
          400: '#13C8E6',
          500: '#00C8E6',
          600: '#00A0B8',
          700: '#00788A',
          800: '#00505C',
          900: '#00282E',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
