/* 生产环境 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const config = require('./webpack.config');
const cssConfig = require('./css.config');
const sassConfig = require('./sass.config');
const lessConfig = require('./less.config');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[chunkhash:5].js',
    chunkFilename: 'script/[chunkhash:5].js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.s(a|c)ss$/,
        use: [MiniCssExtractPlugin.loader, cssConfig, sassConfig]
      },
      { // less, css
        test: /^.*\.(le|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', lessConfig]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style/[chunkhash:5].css',
      chunkFilename: 'style/[chunkhash:5].css'
    }),
    new OptimizeCssAssets()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '.'
    },
    minimizer: [new TerserPlugin()]
  }
});