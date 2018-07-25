/* 生产环境 */
const process = require('process');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const config = require('./webpack.config');
const cssConfig = require('./css.config');
const sassConfig = require('./sass.config');
const lessConfig = require('./less.config');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name].[chunkhash].js',
    chunkFilename: 'script/[name].[chunkhash].js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.sass$/,
        use: [MiniCssExtractPlugin.loader, cssConfig, sassConfig]
      },
      { // less, css
        test: /^.*\.(le|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', lessConfig]
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
      },
      NODE_ENV: process.env.NODE_ENV
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
      },
      NODE_ENV: process.env.NODE_ENV
    }),
    new MiniCssExtractPlugin({
      filename: 'style/[name].[chunkhash].css',
      chunkFilename: 'style/[name].[chunkhash].css'
    }),
    new OptimizeCssAssets()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '.'
    }
  }
});