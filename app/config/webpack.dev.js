/* 开发环境 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config');
const cssConfig = require('./css.config');
const sassConfig = require('./sass.config');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name].js',
    chunkFilename: 'script/[name]_chunk.js'
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      { // sass
        test: /^.*\.sass$/,
        use: ['style-loader', cssConfig, sassConfig]
      },
      { // css
        test: /^.*\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    // html模板
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      hash: true,
      template: path.join(__dirname, '../src/index.pug'),
      excludeChunks: ['videoPlay']
    }),
    new HtmlWebpackPlugin({
      filename: 'videoPlay.html',
      inject: true,
      hash: true,
      template: path.join(__dirname, '../src/modules/VideoPlay/videoPlay.pug'),
      excludeChunks: ['app']
    })
  ]
});