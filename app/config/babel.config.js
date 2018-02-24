/* babel-loader 配置 */
const path = require('path');

module.exports = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: path.join(__dirname, '../.babelCache'),
    presets: ['@babel/preset-flow', '@babel/preset-react'],
    plugins: [
      '@babel/plugin-proposal-decorators',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-object-rest-spread',
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: 'css'
        }
      ]
    ]
  }
};