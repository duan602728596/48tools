/* css-loader 配置 */
// css in js 的输出名称
const name = '[name]__[local]___[hash:base64:15]';

module.exports = {
  path: 'css-loader',
  query: {
    modules: true,
    localIdentName: name
  }
};