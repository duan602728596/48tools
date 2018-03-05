const path = require('path');
const process = require('process');
const os = require('os');
const webpack = require('webpack');
const HappyPack = require('happypack');
const babelConfig = require('./babel.config');
const manifest = require('../.dll/manifest.json');

const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});

function config(options){
  const conf = {
    mode: process.env.NODE_ENV,
    entry: {
      app: path.join(__dirname, '../src/app.js'),
      videoPlay: path.join(__dirname, '../src/modules/VideoPlay/videoPlay.js')
    },
    externals: {
      jquery: 'window.jQuery',
      flvjs: 'window.flvjs'
    },
    module: {
      rules: [
        { // react & js
          test: /^.*\.js$/,
          use: ['happypack/loader?id=babel'],
          exclude: /(dll\.js|appInit\.js|jquery\.min|flv\.min|node_modules)/
        },
        {
          test: /(dll\.js|appInit\.js|jquery\.min|flv\.min)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name]_[hash].[ext]',
                outputPath: 'script/'
              }
            }
          ]
        },
        { // 图片
          test: /^.*\.(jpg|png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 3000,
                name: '[name]_[hash].[ext]',
                outputPath: 'image/',
              }
            }
          ]
        },
        { // 矢量图片 & 文字
          test: /^.*\.(eot|svg|ttf|woff|woff2)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name]_[hash].[ext]',
                outputPath: 'file/'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // dll
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: manifest
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new HappyPack({
        id: 'babel',
        loaders: [babelConfig],
        threadPool: happyThreadPool
      })
    ]
  };

  /* 合并 */
  conf.module.rules = conf.module.rules.concat(options.module.rules);       // 合并rules
  conf.plugins = conf.plugins.concat(options.plugins);                      // 合并插件
  conf.output = options.output;                                             // 合并输出目录
  if('devtool' in options) conf.devtool = options.devtool;                  // 合并source-map配置

  return conf;
}

module.exports = config;
