/* 生产环境 */
const os = require('os');
const path = require('path');
const UglifyJsParallelPlugin = require('webpack-uglify-parallel');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const config = require('./webpack.config');

const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});

/* 合并配置 */
module.exports = config({
  entry: {
    'app': path.join(__dirname, '/src/app.js')
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: 'script/[name]_[chunkhash].js',
    chunkFilename: 'script/[name]_[chunkhash]_chunk.js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'happypack/loader',
              options: {
                id: 'sass_loader'
              }
            }
          ]
        })
      },
      { // css
        test: /^.*\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'happypack/loader',
              options: {
                id: 'css_loader'
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    /* HappyPack */
    // sass
    new HappyPack({
      id: 'sass_loader',
      loaders: [
        {
          path: 'css-loader',
          query: {
            modules: true,
            localIdentName: '[name]__[local]___[hash:base64:15]'
          }
        },
        'sass-loader'
      ],
      threadPool: happyThreadPool,
      verbose: true
    }),
    // css
    new HappyPack({
      id: 'css_loader',
      loaders: ['css-loader'],
      threadPool: happyThreadPool,
      verbose: true
    }),
    // react
    new HappyPack({
      id: 'es6_loader',
      loaders: [
        {
          path: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: ['react'],
            plugins: [
              'transform-decorators-legacy',
              'transform-object-rest-spread',
              [
                'import',
                {
                  'libraryName': 'antd',
                  'style': 'css'
                }
              ]
            ]
          }
        }
      ],
      threadPool: happyThreadPool,
      verbose: true
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
    }),
    // 抽离css
    new ExtractTextPlugin({
      filename: 'style/[name]_[contenthash].css'
    }),
    // html模板
    new HtmlWebpackPlugin({
      inject: true,
      hash: true,
      template: path.join(__dirname, '/src/index.pug'),
      minify: {
        minifyCSS: true,
        minifyJS: true
      }
    })
  ]
});