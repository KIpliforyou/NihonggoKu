/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light mode - Japanese Editorial Minimal
        background: '#F7F6F2',
        surface: '#FFFFFF',
        'primary-text': '#252525',
        'secondary-text': '#858585',
        accent: '#C65D46',
        border: '#E9E7E1',
        'soft-accent': '#F5E8E2',
        // Dark mode - Dark Focus Studio
        'dark-background': '#151820',
        'dark-surface': '#202531',
        'dark-primary-text': '#F1F0EA',
        'dark-secondary-text': '#9A9DA8',
        'dark-accent': '#9D96E8',
        'dark-secondary-accent': '#75B6A5',
        'dark-border': '#343A47',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        jp: ['Noto Sans JP', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
