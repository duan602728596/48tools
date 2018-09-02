/* sass-loader 配置 */
const process = require('process');

module.exports = {
  loader: 'sass-loader',
  options: {
    outputStyle: process.env.NODE_ENV === 'development' ? 'compact' : 'compressed'
  }
};