import { join } from 'node:path';
import { merge } from 'webpack-merge';
import { metaHelper } from '@sweet-milktea/utils';
import { webpackBuild, webpackNodeDefaultEsmBuildConfig } from '../../scripts/utils.mjs';
import packageJson from './package.json' with { type: 'json' };

/** 编译为生产环境的文件 */
const { __dirname } = metaHelper(import.meta.url);

const srcDir = join(__dirname, 'src'),
  buildDir = join(__dirname, 'lib');

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

await webpackBuild(merge(webpackNodeDefaultEsmBuildConfig, {
  mode: 'production',
  entry: {
    index: entryConfig.index.entry,
    nodeMediaServerWorker: entryConfig.nodeMediaServerWorker.entry,
    pocket48LiveWorker: entryConfig.pocket48LiveWorker.entry,
    proxyServerWorker: entryConfig.proxyServerWorker.entry
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs']
    }
  },
  externals: Object.keys(packageJson.dependencies).map((dep) => ({ [dep]: dep })),
  output: {
    path: buildDir,
    filename(x) {
      return entryConfig[x.runtime].output;
    }
  },
  module: {
    rules: [
      {
        test: /^.*\.(m|c)?tsx?$/i,
        use: 'ts-loader'
      }
    ]
  }
}), false);