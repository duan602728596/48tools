import util from 'node:util';
import process from 'node:process';
import path from 'node:path';
import { createRequire } from 'node:module';
import { promises as fsP } from 'node:fs';
import ncc from '@vercel/ncc';
import fse from 'fs-extra';
import rimraf from 'rimraf';
import { requireJson } from '@sweet-milktea/utils';
import { cwd } from './utils.mjs';
import packageJson from '../packages/app/package.json';
import dependenciesOtherFilesJson from '../packages/app/dependenciesOtherFiles.json';

const require = createRequire(import.meta.url);
const rimrafPromise = util.promisify(rimraf);

const argv = process.argv.slice(2);

/* 文件路径 */
const appDir = path.join(cwd, 'packages/app'),        // app文件夹位置
  appNodeModules = path.join(appDir, 'node_modules'); // app文件夹的node_modules
const { dependenciesOtherFiles } = dependenciesOtherFilesJson;

/**
 * ncc文件编译
 * @param { string } input: 文件路径
 * @param { string } output: 输出目录
 */
async function nccBuild(input, output) {
  const { code } = await ncc(input, {
    minify: true,
    externals: ['electron']
  });

  await fse.outputFile(output, code);
}

/**
 * 获取许可证文件
 * @param { string } nodeModulesDir: 模块位置
 * @param { string } depDir: 编译的目标
 */
async function getLICENSE(nodeModulesDir, depDir) {
  const files = await fsP.readdir(nodeModulesDir);
  const license = files.find((o) => /license/i.test(o));

  if (license) {
    await fse.copy(path.join(nodeModulesDir, license), path.join(depDir, license));

    return license;
  }
}

/**
 * 根据依赖名称生成文件
 * @param { string } dependenciesName: 依赖名称
 */
async function createFilesByDependenciesName(dependenciesName) {
  const dependenciesDir = path.join(appNodeModules, dependenciesName); // 模块的输出目录
  const dependenciesNodeModulesDir = path.join(path.parse(require.resolve(dependenciesName))
    .dir.split(/node_modules/)[0], 'node_modules', dependenciesName); // 模块在node_modules中的原位置

  await fse.ensureDir(dependenciesDir); // 创建目录
  await nccBuild(require.resolve(dependenciesName), path.join(dependenciesDir, 'index.js')); // 编译文件

  // 拷贝许可证
  const license = await getLICENSE(dependenciesNodeModulesDir, dependenciesDir);
  const depPackageJson = await requireJson(path.join(dependenciesNodeModulesDir, 'package.json'));

  await fse.writeJSON(path.join(dependenciesDir, 'package.json'), {
    name: dependenciesName,
    version: depPackageJson.version,
    main: 'index.js',
    license,
    author: depPackageJson.author
  });

  // 处理其他文件
  if (dependenciesName in dependenciesOtherFiles) {
    const tasks = dependenciesOtherFiles[dependenciesName];

    for (const task of tasks) {
      if (task.type === 'build') {
        await nccBuild(
          path.join(dependenciesNodeModulesDir, task.input),
          path.join(dependenciesDir, task.output)
        );
      } else if (task.type === 'write') {
        await fse.outputFile(path.join(dependenciesDir, task.output), task.content);
      }
    }
  }
}

async function taskFile() {
  await rimrafPromise(appNodeModules);

  // 创建目录和文件
  for (const depName of Object.keys(packageJson.dependencies)) {
    console.log(`正在编译模块：${ depName }...`);
    await createFilesByDependenciesName(depName);
  }
}

export default taskFile;

if (argv[0] === 'build') {
  taskFile();
}