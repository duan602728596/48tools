import util from 'node:util';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import fse from 'fs-extra/esm';
import zip from 'cross-zip';
import { build, unpacked, isMacOS, isWindows, isArm64 } from './utils.mjs';
import lernaJson from '../lerna.json' with { type: 'json' };

const zipPromise = util.promisify(zip.zip);

const { version } = lernaJson;
const renameDir = {
  mac: path.join(build, `mac/48tools-${ version }-mac`),
  macArm64: path.join(build, `mac-arm64/48tools-${ version }-mac-arm64`),
  win: path.join(build, `win/48tools-${ version }-win64`),
  win32: path.join(build, `win32/48tools-${ version }-win32`),
  winArm64: path.join(build, `win-arm64/48tools-${ version }-win-arm64`),
  linux: path.join(build, `linux/48tools-${ version }-linux64`)
};

/**
 * 删除mac的多语言文件并写入版本号
 * @param { string } unpackedDir - 目录
 */
async function lprojDeleteFilesAndWriteVersion(unpackedDir) {
  // 删除多语言文件
  const files = await glob(path.join(unpackedDir, '48tools.app/Contents/Resources/*.lproj'));
  const deleteTasks = [];

  files.forEach((o) => !/zh_CN/i.test(o) && deleteTasks.push(fse.remove(o)));
  await Promise.all(deleteTasks);

  // 写入版本号
  await fs.writeFile(path.join(unpackedDir, 'version'), `v${ version }`);
}

/**
 * 删除多语言文件并写入版本号
 * @param { string } unpackedDir - 目录
 */
async function pakDeleteFilesAndWriteVersion(unpackedDir) {
  // 删除多语言文件
  const files = await glob(path.join(unpackedDir, 'locales/*.pak'), {
    windowsPathsNoEscape: isWindows ? true : undefined
  });
  const deleteTasks = [];

  files.forEach((o) => !/zh-CN/i.test(o) && deleteTasks.push(fse.remove(o)));
  await Promise.all(deleteTasks);

  // 写入版本号
  await fs.writeFile(path.join(unpackedDir, 'version'), `v${ version }`);
}

async function cleanOthers() {
  // 删除多语言文件并写入版本号
  await Promise.all([
    isMacOS && lprojDeleteFilesAndWriteVersion(unpacked.mac),
    pakDeleteFilesAndWriteVersion(unpacked.win),
    pakDeleteFilesAndWriteVersion(unpacked.win32),
    pakDeleteFilesAndWriteVersion(unpacked.linux)
  ]);

  // 重命名
  await Promise.all([
    isMacOS && fs.rename(unpacked.mac, renameDir.mac),
    fs.rename(unpacked.win, renameDir.win),
    fs.rename(unpacked.win32, renameDir.win32),
    fs.rename(unpacked.linux, renameDir.linux)
  ]);

  // 压缩
  await Promise.all([
    isMacOS && zipPromise(renameDir.mac, `${ renameDir.mac }.zip`),
    zipPromise(renameDir.win, `${ renameDir.win }.zip`),
    zipPromise(renameDir.win32, `${ renameDir.win32 }.zip`),
    zipPromise(renameDir.linux, `${ renameDir.linux }.zip`)
  ]);
}

async function cleanArm64() {
  // 删除多语言文件并写入版本号
  await Promise.all([
    isMacOS && lprojDeleteFilesAndWriteVersion(unpacked.macArm64),
    pakDeleteFilesAndWriteVersion(unpacked.winArm64)
  ]);

  // 重命名
  await Promise.all([
    isMacOS && fs.rename(unpacked.macArm64, renameDir.macArm64),
    fs.rename(unpacked.winArm64, renameDir.winArm64)
  ]);

  // 压缩
  await Promise.all([
    isMacOS && zipPromise(renameDir.macArm64, `${ renameDir.macArm64 }.zip`),
    zipPromise(renameDir.winArm64, `${ renameDir.winArm64 }.zip`)
  ]);
}

async function clean() {
  if (isArm64) {
    await cleanArm64();
  } else {
    await cleanOthers();
  }
}

clean();