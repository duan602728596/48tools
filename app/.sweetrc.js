const path = require('path');
const process = require('process');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  frame: 'react',
  dll: [
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
  ],
  entry: {
    index: [path.join(__dirname, 'src/index.js')],
    videoPlay: [path.join(__dirname, 'src/modules/VideoPlay/videoPlay.js')]
  },
  externals: {
    jquery: 'window.jQuery',
    'flv.js': 'window.flvjs'
  },
  resolve: {
    alias: {
      'indexeddb-tools': 'indexeddb-tools/build/indexedDB-tools.js'
    }
  },
  rules: [
    {
      test: /(init\.js|jquery|flv\.min)/,
      use: [{
        loader: 'file-loader',
        options: {
          name: isDevelopment ? '[name].[hash:5].[ext]' : '[hash:5].[ext]',
          outputPath: 'script/'
        }
      }]
    }
  ],
  js: {
    ecmascript: true,
    plugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
    exclude: /(dll\.js|appInit\.js|jquery|flv\.min|node_modules)/
  },
  sass: { include: /src/ },
  css: {
    modules: false,
    modifyVars: {
      // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
      '@primary-color': '#f5222d',
      '@layout-body-background': '#fff',
      '@layout-header-background': '@primary-color'
    },
    include: /node_modules[\\/]antd/
  },
  html: [
    { template: path.join(__dirname, 'src/index.pug'), excludeChunks: ['videoPlay'] },
    { template: path.join(__dirname, 'src/modules/VideoPlay/videoPlay.pug'), excludeChunks: ['index'] }
  ]
};
