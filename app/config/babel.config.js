/* babel-loader 配置 */
module.exports = {
  path: 'babel-loader',
  query: {
    cacheDirectory: true,
    presets: ['react'],
    plugins: [
      'transform-decorators-legacy',
      'transform-object-rest-spread',
      [
        'import',
        {
          'libraryName': 'antd',
          'style': 'css'
        }
      ],
      'transform-flow-strip-types'
    ]
  }
};