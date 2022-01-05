import util from 'node:util';
import path from 'node:path';
import { createRequire } from 'node:module';
import { promises as fsP } from 'node:fs';
import ncc from '@vercel/ncc';
import fse from 'fs-extra';
import rimraf from 'rimraf';
import { requireJson } from '@sweet-milktea/utils';
import { cwd } from './utils.mjs';

const require = createRequire(import.meta.url);
const rimrafPromise = util.promisify(rimraf);

const otherFile = {
  '@electron/remote': {
    input: 'main/index.js',
    output: 'main/index.js'
  }
};

/* 文件路径 */
const appDir = path.join(cwd, 'packages/app'),
  nodeModules = path.join(appDir, 'node_modules');

const packageJson = await requireJson(path.join(appDir, 'package.json'));

/**
 * ncc文件编译
 * @param { string } input: 文件路径
 * @param { string } output: 输出目录
 */
async function nccBuild(input, output) {
  const { code } = await ncc(input, {
    minify: true
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

async function taskFile() {
  await rimrafPromise(nodeModules);
  const { dependencies } = packageJson;

  // 创建目录和文件
  for (const depName of Object.keys(dependencies)) {
    console.log(`正在编译模块：${ depName }...`);
    const depDir = path.join(nodeModules, depName); // 编译模块位置
    const parseResult = path.parse(require.resolve(depName));
    const nodeModulesDir = path.join(parseResult.dir.split(/node_modules/)[0], 'node_modules', depName); // 模块原位置

    // 创建目录
    await fse.ensureDir(depDir);

    // 编译文件
    await nccBuild(require.resolve(depName), path.join(depDir, 'index.js'));

    // 拷贝许可证
    const license = await getLICENSE(nodeModulesDir, depDir);
    const depPackageJson = await requireJson(path.join(nodeModulesDir, 'package.json'));

    await fse.writeJSON(path.join(depDir, 'package.json'), {
      name: depName,
      version: depPackageJson.version,
      main: 'index.js',
      license: license ?? '',
      author: depPackageJson.author ?? ''
    });

    // 处理其他文件
    if (depName in otherFile) {
      await nccBuild(path.join(nodeModulesDir, otherFile[depName].input), path.join(depDir, otherFile[depName].output));
    }
  }
}

taskFile();