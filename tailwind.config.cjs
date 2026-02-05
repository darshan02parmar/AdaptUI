/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {}
  },
  corePlugins: {
    // Tailwind is used primarily for marketing/landing components (e.g. `Hero3`).
    // Disable preflight to avoid resetting styles in the existing app CSS.
    preflight: false
  },
  plugins: []
};
