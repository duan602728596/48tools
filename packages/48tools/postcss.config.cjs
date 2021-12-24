const tailwindcss = require('tailwindcss');

module.exports = {
  plugins: [
    tailwindcss({
      content: ['./src/**/*.{ts,tsx,js,jsx}']
    })
  ]
};