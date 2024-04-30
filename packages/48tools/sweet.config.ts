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
 * @param { Array<string> } node - node模块名称
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
 * @param { Array<string> } node - node模块名称
 */
function nodeModules(node: Array<string>): Array<string> {
  return node.concat(node.map((o: string): string => `node:${ o }`));
}

/**
 * 创建路径
 * @param { string } p - 路径
 */
function srcPath(p: string): string {
  return path.join(__dirname, 'src', p);
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
    ['@babel/plugin-syntax-import-attributes', { deprecatedAssertSyntax: true }],
    ['@48tools/babel-plugin-delay-require', { moduleNames: externalsName, idle: true }]
  ].filter(Boolean);

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      '@ant-design/icons',
      '@bbkkbkk/q',
      '@indexeddb-tools/indexeddb',
      '@indexeddb-tools/indexeddb-redux',
      '@mdx-js/react',
      '@reduxjs/toolkit',
      '@reduxjs/toolkit/query/react',
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
      'react/jsx-dev-runtime',
      'react-dom/client',
      'react-dom/server.browser',
      'react-redux',
      'react-router-dom',
      'react-sortable-hoc',
      'redux-saga',
      'redux-saga/effects',
      'reselect'
    ],
    entry: {
      index: [srcPath('index.tsx')],
      player: [srcPath('player.tsx')]
    },
    html: [
      { template: srcPath('index.pug'), minify: htmlWebpackPluginMinify },
      { template: srcPath('player.pug'), minify: htmlWebpackPluginMinify }
    ],
    externals: nodeExternals(externalsName),
    resolve: {
      alias: {
        '@48tools-api': srcPath('services')
      }
    },
    javascript: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|toutiaosdk-acrawler\.js|Signer\.js/i
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
        test: /toutiaosdk-acrawler\.js/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
      {
        test: /\.tailwindcss\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.mdx$/,
        use: [{
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: '@mdx-js/react'
          }
        }]
      }
    ],
    plugins: [
      new CopyPlugin({
        patterns: [{
          from: srcPath('pages/48/sdk/1'),
          to: path.join(__dirname, 'dist')
        }]
      }),
      analyzer && new BundleAnalyzerPlugin()
    ].filter(Boolean)
  };

  return config;
}