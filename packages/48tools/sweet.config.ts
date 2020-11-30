import * as process from 'process';
import * as path from 'path';

const isDev: boolean = process.env.NODE_ENV === 'development';

function nodeExternals(node: Array<string>): { [k: string]: string } {
  const result: { [k: string]: string } = {};

  for (const name of node) {
    result[name] = `globalThis.require('${ name }')`;
  }

  return result;
}

export default function(info: object): { [key: string]: any } {
  const plugins: Array<any> = [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    ['import', { libraryName: 'lodash', libraryDirectory: '', camel2DashComponentName: false }, 'lodash']
  ];

  if (!isDev) {
    plugins.unshift(['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]);
  }

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      'react',
      'react-dom',
      'prop-types',
      '@reduxjs/toolkit',
      'react-redux',
      'reselect',
      'react-router',
      'react-router-dom',
      'history'
    ],
    entry: {
      index: [path.join(__dirname, 'src/index.tsx')],
      player: [path.join(__dirname, 'src/pages/48/Player/Player.tsx')]
    },
    externals: {
      SDK: 'window.SDK',
      ...nodeExternals([
        'fs',
        'url',
        'electron',
        'got'
      ])
    },
    js: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|NIM_Web_SDK/i
    },
    ts: {
      configFile: isDev ? 'tsconfig.json' : 'tsconfig.prod.json',
      plugins,
      exclude: /node_modules/
    },
    rules: [
      {
        test: /NIM_Web_SDK/,
        use: [{
          loader: 'file-loader',
          options: {
            name: isDev ? '[name]_[hash:5].[ext]' : '[name]_[hash:15].[ext]'
          }
        }]
      }
    ],
    sass: {
      include: /src/
    },
    css: {
      modifyVars: {
        // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
        '@primary-color': '#13c2c2'
      },
      include: /node_modules[\\/]_?antd/
    },
    html: [
      { template: path.join(__dirname, 'src/index.pug'), excludeChunks: ['player'] },
      { template: path.join(__dirname, 'src/pages/48/Player/player.pug'), excludeChunks: ['index'] }
    ]
  };

  return config;
}