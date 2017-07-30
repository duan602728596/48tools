const webpack = require('webpack');
const manifest = require('./.dll/manifest.json');

function config(options){
  const conf = {
    module: {
      rules: [
        { // react & js
          test: /^.*\.js$/,
          use: [
            {
              loader: 'happypack/loader',
              options: {
                id: 'es6_loader'
              }
            }
          ],
          exclude: /(dll\.js|node_modules)/
        },
        { // dll.js
          test: /(dll\.js|common\.js)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'script/[name]_[hash].[ext]'
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
                pretty: true,
                name: '[name].html'
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
                name: 'image/[name]_[hash].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // 公共模块
      /*
       new webpack.optimize.CommonsChunkPlugin({
       name: 'vendor'
       }),
       */
      // 范围提升
      new webpack.optimize.ModuleConcatenationPlugin(),
      // dll
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: manifest
      })
    ]
  };

  /* 合并 */
  conf.entry = options.entry;                                               // 合并入口文件
  conf.module.rules = conf.module.rules.concat(options.module.rules);       // 合并rules
  conf.plugins = conf.plugins.concat(options.plugins);                      // 合并插件
  conf.output = options.output;                                             // 合并输出目录
  if('devtool' in options){                                                 // 合并source-map配置
    conf.devtool = options.devtool;
  }

  return conf;
}

module.exports = config;