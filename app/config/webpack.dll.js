/* 预先编译dll */
const path = require('path');
const os = require('os');
const process = require('process');
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
      'redux-thunk',
      'redux-logger',
      'redux-actions',
      'immutable',
      'redux-immutable',
      'reselect',
      'indexeddb-tools',
      'indexeddb-tools-redux',
      'rc-queue-anim'
    ]
  },
  output: {
    path: path.join(__dirname, '../.dll'),
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
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