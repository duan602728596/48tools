import path from 'node:path';
import { metaHelper } from '@sweet-milktea/utils';
import { require, webpackBuild } from '../../scripts/utils.mjs';

export const { __dirname } = metaHelper(import.meta.url);

/**
 * webpack打包
 */
await webpackBuild({
  mode: 'development',
  entry: {
    index: [require.resolve('got')]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.cjs',
    library: { type: 'commonjs' },
    globalObject: 'globalThis'
  },
  devtool: 'source-map',
  externalsPresets: { node: true },
  target: ['node', 'node20'],
  performance: { hints: false },
  node: {
    __filename: true,
    __dirname: true
  }
});