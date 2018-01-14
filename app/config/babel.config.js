/* babel-loader 配置 */
module.exports = {
  path: 'babel-loader',
  query: {
    cacheDirectory: true,
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