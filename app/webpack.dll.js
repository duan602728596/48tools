/* 预先编译dll */
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');
const HappyPack = require('happypack');

const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});

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
      'reselect',
      'antd'
    ]
  },
  output: {
    path: path.join(__dirname, '/.dll'),
    filename: '[name].js',
    library: '[name]_[hash]',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      { // css
        test: /^.*\.css$/,
        use: [
          {
            loader: 'happypack/loader',
            options: {
              id: 'css_loader'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    /* HappyPack */
    // css
    new HappyPack({
      id: 'css_loader',
      loaders: ['style-loader', 'css-loader'],
      threadPool: happyThreadPool,
      verbose: true
    }),
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