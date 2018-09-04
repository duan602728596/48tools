/* 开发环境 */
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.config');
const cssConfig = require('./css.config');
const sassConfig = require('./sass.config');
const lessConfig = require('./less.config');
const manifestJson = require('../.dll/manifest.json');

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name].js',
    chunkFilename: 'script/[name].js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.s(a|c)ss$/,
        use: ['style-loader', cssConfig, sassConfig]
      },
      { // less, css
        test: /^.*\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', lessConfig]
      }
    ]
  },
  plugins: [
    // dll
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: manifestJson
    })
  ]
});