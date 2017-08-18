/* sass-loader 配置 */
const process = require('process');

function output(env){
  switch(env){
    case 'development': // 开发环境
      return 'compact';
    case 'production':  // 生产环境
      return 'compressed';
  }
}

// 根据当前环境配置sass输出格式
// development
// production
const env = process.env.NODE_ENV;
const out = output(env);

module.exports = {
  path: 'sass-loader',
  query: {
    outputStyle: out
  }
};