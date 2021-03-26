const util = require('util');
const { promises: fs } = require('fs');
const glob = require('glob');
const path = require('path');
const fse = require('fs-extra');
const { build, unpacked } = require('./utils');
const { version } = require('../lerna.json');

const globPromise = util.promisify(glob);

/**
 * 删除mac的多语言文件并写入版本号
 * @param { string } unpackedDir: 目录
 */
async function lprojDeleteFilesAndWriteVersion(unpackedDir) {
  // 删除多语言文件
  const files = await globPromise(path.join(unpackedDir, '48tools.app/Contents/Resources/*.lproj'));
  const deleteTasks = [];

  files.forEach((o) => !/zh_CN/i.test(o) && deleteTasks.push(fse.remove(o)));
  await Promise.all(deleteTasks);

  // 写入版本号
  await fs.writeFile(path.join(unpackedDir, 'version'), `v${ version }`);
}

/**
 * 删除多语言文件并写入版本号
 * @param { string } unpackedDir: 目录
 */
async function pakDeleteFilesAndWriteVersion(unpackedDir) {
  // 删除多语言文件
  const files = await globPromise(path.join(unpackedDir, 'locales/*.pak'));
  const deleteTasks = [];

  files.forEach((o) => !/zh-CN/i.test(o) && deleteTasks.push(fse.remove(o)));
  await Promise.all(deleteTasks);

  // 写入版本号
  await fs.writeFile(path.join(unpackedDir, 'version'), `v${ version }`);
}

async function clean() {
  // 删除多语言文件并写入版本号
  await Promise.all([
    lprojDeleteFilesAndWriteVersion(unpacked.mac),
    lprojDeleteFilesAndWriteVersion(unpacked.macArm64),
    pakDeleteFilesAndWriteVersion(unpacked.win),
    pakDeleteFilesAndWriteVersion(unpacked.win32),
    pakDeleteFilesAndWriteVersion(unpacked.linux)
  ]);

  // 重命名
  await Promise.all([
    fs.rename(unpacked.mac, path.join(build, `mac/48tools-${ version }-mac`)),
    fs.rename(unpacked.macArm64, path.join(build, `mac-arm64/48tools-${ version }-mac-arm64`)),
    fs.rename(unpacked.win, path.join(build, `win/48tools-${ version }-win64`)),
    fs.rename(unpacked.win32, path.join(build, `win32/48tools-${ version }-win32`)),
    fs.rename(unpacked.linux, path.join(build, `linux/48tools-${ version }-linux64`))
  ]);
}

clean();