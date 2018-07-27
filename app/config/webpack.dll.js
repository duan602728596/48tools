/* 预先编译dll */
const process = require('process');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    'dll': [
      'react',
      'react-dom',
      'prop-types',
      'react-router-dom',
      'redux',
      'react-redux',
      'redux-thunk',
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
    library: '[name]_[hash:5]',
    libraryTarget: 'var'
  },
  devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : 'none',
  plugins: [
    // dll
    new webpack.DllPlugin({
      path: '.dll/manifest.json',
      name: '[name]_[hash:5]',
      context: __dirname
    })
  ]
};