import process from 'node:process';
import path from 'node:path';
import ncc from '@vercel/ncc';
import fse from 'fs-extra/esm';
import { rimraf } from 'rimraf';
import { merge } from 'webpack-merge';
import { requireJson } from '@sweet-milktea/utils';
import { require, appDir, webpackBuild, webpackNodeDefaultCjsBuildConfig } from './utils.mjs';
import { buildModules } from '../packages/esm-build/buildModules.mjs';
import { appPackageJson } from './jsonImport/jsonImport.mjs';

const argv = process.argv.slice(2);

/* 文件路径 */
const appNodeModules = path.join(appDir, 'node_modules'); // app文件夹的node_modules

/**
 * ncc文件编译
 * @param { string } input - 文件路径
 * @param { string } output - 输出目录
 */
async function nccBuild(input, output) {
  const { code } = await ncc(input, {
    minify: true,
    target: 'es2020',
    externals: ['electron']
  });

  await fse.outputFile(output, code);
}

/**
 * webpack编译
 * @param { string } input - 文件路径
 * @param { string } output - 输出目录
 */
async function webpackBuildPackage(input, output) {
  const parseResult = path.parse(output);

  await webpackBuild(merge(webpackNodeDefaultCjsBuildConfig, {
    mode: 'production',
    entry: {
      index: [input]
    },
    output: {
      path: parseResult.dir,
      filename: parseResult.base
    }
  }), true);
}

/**
 * 根据依赖名称生成文件
 * @param { string } dependenciesName - 依赖名称
 */
async function createFilesByDependenciesName(dependenciesName) {
  const dependenciesDir = path.join(appNodeModules, dependenciesName); // 模块的输出目录
  const dependenciesNodeModulesDir = path.join(path.parse(require.resolve(dependenciesName))
    .dir.split(/node_modules/)[0], 'node_modules', dependenciesName); // 模块在node_modules中的原位置

  await fse.ensureDir(dependenciesDir); // 创建目录

  if (buildModules.includes(dependenciesName)) {
    // esm模块使用webpack编译
    await webpackBuildPackage(require.resolve(dependenciesName), path.join(dependenciesDir, 'index.js'));
  } else {
    await nccBuild(require.resolve(dependenciesName), path.join(dependenciesDir, 'index.js')); // 编译文件
  }

  // 拷贝许可证
  const depPackageJson = await requireJson(path.join(dependenciesNodeModulesDir, 'package.json'));

  await fse.writeJSON(path.join(dependenciesDir, 'package.json'), {
    name: dependenciesName,
    version: depPackageJson.version,
    main: 'index.js',
    license: depPackageJson.license,
    author: depPackageJson.author
  });
}

async function taskFile() {
  await rimraf(appNodeModules);

  // 创建目录和文件
  for (const depName of Object.keys(appPackageJson.dependencies)) {
    if (!['node-nim'].includes(depName)) {
      console.log(`正在编译模块：${ depName }...`);
      await createFilesByDependenciesName(depName);
    }
  }
}

export default taskFile;

if (argv[0] === 'build') {
  taskFile();
}