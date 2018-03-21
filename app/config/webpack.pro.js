/* 生产环境 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const config = require('./webpack.config');
const cssConfig = require('./css.config');
const sassConfig = require('./sass.config');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name]_[chunkhash].js',
    chunkFilename: 'script/[name]_[chunkhash]_chunk.js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.sass$/,
        use: [MiniCssExtractPlugin.loader, cssConfig, sassConfig]
      },
      { // css
        test: /^.*\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
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
      excludeChunks: ['videoPlay'],
      minify: {
        minifyCSS: true,
        minifyJS: true
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'videoPlay.html',
      inject: true,
      hash: true,
      template: path.join(__dirname, '../src/modules/VideoPlay/videoPlay.pug'),
      excludeChunks: ['app'],
      minify: {
        minifyCSS: true,
        minifyJS: true
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'style/[name]_[chunkhash].css',
      chunkFilename: 'style/[name]_[chunkhash]_chunk.css'
    }),
    new OptimizeCssAssets()
  ]
});