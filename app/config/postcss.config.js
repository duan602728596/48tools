/* postcss-loader 配置 */
const autoprefixer = require('autoprefixer');

const plugins = [
  autoprefixer
];

module.exports = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins
  }
};