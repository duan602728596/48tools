/* babel-loader 配置 */
module.exports = {
  path: 'babel-loader',
  query: {
    cacheDirectory: true,
    presets: ['@babel/flow', '@babel/react'],
    plugins: [
      '@babel/proposal-decorators',
      '@babel/proposal-object-rest-spread',
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