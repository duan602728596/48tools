import path from 'node:path';
import { merge } from 'webpack-merge';
import { metaHelper } from '@sweet-milktea/utils';
import { require, webpackBuild, webpackNodeDefaultCjsBuildConfig } from '../../scripts/utils.mjs';
import { buildModules } from './buildModules.mjs';

const { __dirname } = metaHelper(import.meta.url);

const outputDist = path.join(__dirname, 'dist');

/**
 * webpack打包
 * @param { string } packageName - 模块名
 */
function esmBuild(packageName) {
  return webpackBuild(merge(webpackNodeDefaultCjsBuildConfig, {
    mode: 'development',
    entry: {
      index: [require.resolve(packageName)]
    },
    output: {
      path: outputDist,
      filename: `${ packageName }.cjs`
    },
    devtool: 'source-map'
  }));

}

/* 需要将esm编译成cjs的模块 */
for (const esmToCjsModule of buildModules) {
  console.log(`正在编译：${ esmToCjsModule }...`);
  await esmBuild(esmToCjsModule);
  console.log(`编译完成：${ esmToCjsModule }。`);
}