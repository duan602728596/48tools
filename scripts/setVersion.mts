import { argv } from 'node:process';
import { writeFile as writeFileAsync } from 'node:fs/promises';
import { join } from 'node:path';
import { readJSON } from 'fs-extra/esm';
import { cwd, appDir } from './utils.mjs';

const newVersion: string = argv[2];

/**
 * 修改单个json文件的version
 * @param { string } filePath - 文件路径
 */
async function changePackageJsonVersion(filePath: string): Promise<void> {
  const packageJson: {
    version: string;
  } = await readJSON(filePath, { encoding: 'utf8' });

  packageJson.version = newVersion;

  await writeFileAsync(filePath, `${
    JSON.stringify(packageJson, null, 2)
  }${
    filePath.includes('package.json') ? '\n' : ''
  }`, { encoding: 'utf8' });
}

/* 使用脚本，统一修改版本号 */
async function setVersion(): Promise<void> {
  await Promise.all([
    changePackageJsonVersion(join(appDir, 'package.json')),
    changePackageJsonVersion(join(cwd, 'packages/48tools/package.json')),
    changePackageJsonVersion(join(cwd, 'packages/main/package.json')),
    changePackageJsonVersion(join(cwd, 'lerna.json'))
  ]);
}

if (newVersion && newVersion !== '') {
  setVersion();
}
