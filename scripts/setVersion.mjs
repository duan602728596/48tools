import process from 'node:process';
import fsP from 'node:fs/promises';
import path from 'node:path';
import fse from 'fs-extra/esm';
import { cwd, appDir } from './utils.mjs';

const newVersion = process.argv[2];

/**
 * 修改单个json文件的version
 * @param { string } filePath: 文件路径
 */
async function changePackageJsonVersion(filePath) {
  const packageJson = await fse.readJSON(filePath, { encoding: 'utf8' });

  packageJson.version = newVersion;

  await fsP.writeFile(filePath, `${
    JSON.stringify(packageJson, null, 2)
  }${
    filePath.includes('package.json') ? '\n' : ''
  }`, { encoding: 'utf8' });
}

/* 使用脚本，统一修改版本号 */
async function setVersion() {
  await Promise.all([
    changePackageJsonVersion(path.join(appDir, 'package.json')),
    changePackageJsonVersion(path.join(cwd, 'packages/48tools/package.json')),
    changePackageJsonVersion(path.join(cwd, 'packages/main/package.json')),
    changePackageJsonVersion(path.join(cwd, 'lerna.json'))
  ]);
}

if (newVersion && newVersion !== '') {
  setVersion();
}
