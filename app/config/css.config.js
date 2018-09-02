/* css-loader 配置 */
const process = require('process');

module.exports = {
  loader: 'css-loader',
  options: {
    modules: true,
    localIdentName: process.env.NODE_ENV === 'development'
      ? '[path][name]__[local]___[hash:base64:5]'
      : '_[hash:base64:5]'
  }
};