/* 预先编译dll */
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');

module.exports = {
  entry: {
    'dll': [
      'react',
      'react-dom',
      'react-router-dom',
      'redux',
      'react-redux',
      'redux-actions',
      'immutable',
      'redux-immutable',
      'reselect'
    ]
  },
  output: {
    path: path.join(__dirname, '/.dll'),
    filename: '[name].js',
    library: '[name]_[hash]',
    libraryTarget: 'var'
  },
  plugins: [
    // dll
    new webpack.DllPlugin({
      path: '.dll/manifest.json',
      name: '[name]_[hash]',
      context: __dirname,
      sourceType: 'var'
    }),
    // 代码压缩
    new UglifyJsParallelPlugin({
      workers: os.cpus().length,
      mangle: true,
      compressor: {
        warnings: true,
        drop_console: true,
        drop_debugger: true
      }
    })
  ]
};