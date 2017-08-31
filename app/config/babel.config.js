/* babel-loader 配置 */
module.exports = {
  path: 'babel-loader',
  query: {
    cacheDirectory: true,
    presets: ['flow', 'react'],
    plugins: [
      'transform-decorators-legacy',    // 装饰器
      'transform-object-rest-spread',   // 对象的扩展
      [
        'import',
        {
          'libraryName': 'antd',
          'style': 'css'
        }
      ]
    ]
  }
};