/* css-loader 配置 */
const process = require('process');

function output(env){
  switch(env){
    case 'development': // 开发环境
      return '[path][name]__[local]___[hash:base64:5]';
    case 'production':  // 生产环境
      return '_[hash:base64:5]';
  }
}

// 根据当前环境配置css-in-js的name
const env = process.env.NODE_ENV;
const name = output(env);

module.exports = {
  loader: 'css-loader',
  options: {
    modules: true,
    localIdentName: name
  }
};