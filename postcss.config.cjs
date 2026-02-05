// PostCSS pipeline: Tailwind first (class expansion), Autoprefixer last (vendor prefixes).
module.exports = {
  plugins: {
    // Tailwind utilities first, then vendor prefixing.
    tailwindcss: {},
    autoprefixer: {}
  }
};
