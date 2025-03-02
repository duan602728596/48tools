import { join } from 'node:path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { metaHelper } from '@sweet-milktea/utils';
import { webpackBuild, webpackNodeDefaultEsmBuildConfig } from '../../scripts/utils.mjs';
import packageJson from './package.json' with { type: 'json' };

/** 编译为生产环境的文件 */
const { __dirname } = metaHelper(import.meta.url);

const srcDir = join(__dirname, 'src'),
  buildDir = join(__dirname, 'lib');

/* 文件入口配置 */
const entryConfig = {
  index: {
    entry: [join(srcDir, 'main.mts')],
    output: 'main.mjs'
  },
  nodeMediaServerWorker: {
    entry: [join(srcDir, 'nodeMediaServer/server.worker.mts')],
    output: 'nodeMediaServer/server.worker.mjs'
  },
  pocket48LiveWorker: {
    entry: [join(srcDir, 'pocket48Live/liveDownload.worker.mts')],
    output: 'pocket48Live/liveDownload.worker.mjs'
  },
  proxyServerWorker: {
    entry: [join(srcDir, 'proxyServer/httpProxyServer.worker.mts')],
    output: 'proxyServer/httpProxyServer.worker.mjs'
  }
};

/* webpack编译 */
await webpackBuild(merge(webpackNodeDefaultEsmBuildConfig, {
  entry: {
    index: entryConfig.index.entry,
    nodeMediaServerWorker: entryConfig.nodeMediaServerWorker.entry,
    pocket48LiveWorker: entryConfig.pocket48LiveWorker.entry,
    proxyServerWorker: entryConfig.proxyServerWorker.entry
  },
  output: {
    path: buildDir,
    filename(x) {
      return entryConfig[x.runtime].output;
    }
  },
  externals: Object.keys(packageJson.dependencies).map((dep) => ({ [dep]: dep })),
  module: {
    rules: [
      {
        test: /^.*\.(m|c)?tsx?$/i,
        use: 'ts-loader'
      }
    ]
  },
  plugins: [
    // TODO: 注入import.meta.url，防止被重写
    new webpack.BannerPlugin({
      banner: 'globalThis.__IMPORT_META_URL__ = import.meta.url;',
      raw: true,
      entryOnly: true
    })
  ]
}), false);