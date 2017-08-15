/* 生产环境 */
const os = require('os');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
      },
      { // pug
        test: /^.*\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              name: '[name].html'
            }
          }
        ]
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
        {
          path: 'sass-loader',
          query: {
            outputStyle: 'compressed'
          }
        }
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
    // 代码压缩
    new UglifyJSPlugin({
      uglifyOptions: {
        warnings: true,
        output: {
          comments: false,
          beautify: false,
          quote_style: 3
        }
      },
      parallel: {
        cache: true,
        workers: os.cpus().length
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