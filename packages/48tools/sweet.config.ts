import * as process from 'node:process';
import * as path from 'node:path';
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// @ts-ignore
import CopyPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';

const isDev: boolean = process.env.NODE_ENV === 'development';
const analyzer: boolean = process.env.ANALYZER === 'true';

// html代码压缩配置
const htmlWebpackPluginMinify: boolean | HtmlMinifierOptions = isDev ? false : {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: {
    module: true,
    ecma: 2020,
    safari10: true
  }
};

/**
 * 模块使用node的commonjs的方式引入
 * @param { Array<string> } node: node模块名称
 */
function nodeExternals(node: Array<string>): Record<string, `globalThis.require('${ string }')`> {
  const result: Record<string, `globalThis.require('${ string }')`> = {};

  for (const name of node) {
    result[name] = `globalThis.require('${ name }')`;
  }

  return result;
}

/**
 * 为node原生模块添加"node:"
 * @param { Array<string> } node: node模块名称
 */
function nodeModules(node: Array<string>): Array<string> {
  return node.concat(node.map((o: string): string => `node:${ o }`));
}

const externalsName: Array<string> = nodeModules([
  'child_process',
  'crypto',
  'fs',
  'fs/promises',
  'net',
  'os',
  'path',
  'process',
  'stream/promises',
  'timers',
  'timers/promises',
  'url',
  'util'
]).concat([
  'electron',
  'fluent-ffmpeg',
  'got',
  'hpagent',
  'playwright-core'
]);

export default function(info: object): Record<string, any> {
  const plugins: Array<any> = [
    '@babel/plugin-syntax-import-assertions',
    !isDev && ['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }],
    ['@48tools/babel-plugin-delay-require', { moduleNames: externalsName, idle: true }]
  ].filter(Boolean);

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      '@indexeddb-tools/indexeddb',
      '@indexeddb-tools/indexeddb-redux',
      '@yxim/nim-web-sdk/dist/SDK/NIM_Web_SDK.js',
      'antd',
      'array-move',
      'classnames',
      'cookie',
      'dayjs',
      'dayjs/locale/zh-cn',
      'filenamify/browser',
      'hls.js',
      'mpegts.js',
      'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK',
      'nim-web-sdk-ng/dist/NIM_BROWSER_SDK',
      'path-to-regexp',
      'qrcode/lib/browser',
      'react',
      'react-dom/client',
      'react-dom/server.browser',
      'prop-types',
      '@reduxjs/toolkit',
      '@reduxjs/toolkit/query/react',
      'react-redux',
      'reselect',
      'react-router-dom'
    ],
    entry: {
      index: [path.join(__dirname, 'src/index.tsx')],
      player: [path.join(__dirname, 'src/player.tsx')]
    },
    html: [
      { template: path.join(__dirname, 'src/index.pug'), minify: htmlWebpackPluginMinify },
      { template: path.join(__dirname, 'src/player.pug'), minify: htmlWebpackPluginMinify }
    ],
    externals: nodeExternals(externalsName),
    resolve: {
      alias: {
        '@48tools-api': path.join(__dirname, 'src/services')
      }
    },
    javascript: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|toutiaosdk-(acrawler|captcha)\.js|Signer\.js/i
    },
    typescript: {
      configFile: isDev ? 'tsconfig.json' : 'tsconfig.prod.json',
      plugins,
      exclude: /node_modules|Signer\.js/
    },
    sass: {
      include: /src/
    },
    less: {
      include: /node_modules[\\/]_?antd/,
      exclude: /tailwindcss/i
    },
    rules: [
      {
        test: /toutiaosdk-(acrawler|captcha)\.js/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
      {
        test: /\.tailwindcss\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ],
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: path.join(__dirname, 'src/pages/48/sdk/1'),
          to: path.join(__dirname, 'dist')
        }]
      }),
      analyzer && new BundleAnalyzerPlugin()
    ].filter(Boolean)
  };

  return config;
}