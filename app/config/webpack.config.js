const process = require('process');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const babelConfig = require('./babel.config');

function config(options){
  const { NODE_ENV } = process.env;
  const isDevelopment = NODE_ENV === 'development';
  const fileName = isDevelopment ? '[name].[ext]' : '[hash:5].[ext]';
  const conf = {
    mode: NODE_ENV,
    devtool: isDevelopment ? 'cheap-module-source-map' : 'none',
    entry: {
      app: [path.join(__dirname, '../src/app.js')],
      videoPlay: [path.join(__dirname, '../src/modules/VideoPlay/videoPlay.js')]
    },
    externals: {
      jquery: 'window.jQuery',
      flvjs: 'window.flvjs'
    },
    module: {
      rules: [
        { // react & js
          test: /^.*\.js$/,
          use: [babelConfig],
          exclude: /(dll\.js|appInit\.js|jquery\.min|flv\.min|node_modules)/
        },
        {
          test: /(dll\.js|appInit\.js|jquery\.min|flv\.min)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: fileName,
                outputPath: 'script/'
              }
            }
          ]
        },
        { // 图片
          test: /^.*\.(jpe?g|png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                fallback: {
                  loader: 'file-loader',
                  options: {
                    name: fileName,
                    outputPath: 'image/'
                  }
                }
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
                name: fileName,
                outputPath: 'file/'
              }
            }
          ]
        },
        { // pug
          test: /^.*\.pug$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: isDevelopment,
                name: '[name].html'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // html模板
      new HtmlWebpackPlugin({
        filename: 'index.html',
        inject: true,
        template: path.join(__dirname, '../src/index.pug'),
        excludeChunks: ['videoPlay'],
        NODE_ENV
      }),
      new HtmlWebpackPlugin({
        filename: 'videoPlay.html',
        inject: true,
        template: path.join(__dirname, '../src/modules/VideoPlay/videoPlay.pug'),
        excludeChunks: ['app'],
        NODE_ENV
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  };

  /* 合并 */
  conf.module.rules = conf.module.rules.concat(options.module.rules);       // 合并rules
  conf.plugins = conf.plugins.concat(options.plugins);                      // 合并插件
  conf.output = options.output;                                             // 合并输出目录
  if('optimization' in options) conf.optimization = options.optimization;   // 合并optimization

  return conf;
}

module.exports = config;