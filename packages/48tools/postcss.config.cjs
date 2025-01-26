const tailwindcss = require('tailwindcss');
const { default: removeClassnames } = require('@48tools/postcss-plugin-remove-classnames');

module.exports = {
  plugins: [
    tailwindcss({
      content: ['./src/**/*.{ts,tsx,js,jsx}']
    }),
    removeClassnames({
      removeClassNames: ['transform', 'filter'],
      removeProperty: ['--tw-']
    })
  ]
};