/* postcss-loader 配置 */
const plugins = [
  require('autoprefixer')
];

module.exports = {
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins
  }
};