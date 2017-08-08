/* 预先编译dll */
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
      'redux-thunk',
      'immutable',
      'redux-immutable',
      'reselect',
      'antd',
      'indexeddb-tools',
      'indexeddb-tools-redux'
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
    new UglifyJSPlugin({
      uglifyOptions: {
        warnings: true,
        output: {
          comments: false,
          beautify: false,
          quote_style: 3
        }
      }
    })
  ]
};