import path from 'node:path';
import { merge } from 'webpack-merge';
import { metaHelper } from '@sweet-milktea/utils';
import { require, webpackBuild, webpackNodeDefaultCjsBuildConfig } from '../../scripts/utils.mjs';

export const { __dirname } = metaHelper(import.meta.url);

/**
 * webpack打包
 */
await webpackBuild(merge(webpackNodeDefaultCjsBuildConfig, {
  mode: 'development',
  entry: {
    index: [require.resolve('got')]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.cjs'
  },
  devtool: 'source-map'
}));