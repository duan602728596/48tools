import path from 'path';
import { metaHelper } from '@sweet-milktea/utils';

export const { __dirname } = metaHelper(import.meta.url);

// 定义文件位置
export const cwd = path.join(__dirname, '../');      // 网站目录
export const appDir = path.join(cwd, 'www');         // 中间代码
export const staticsDir = path.join(cwd, 'statics'); // 静态资源目录
export const build = path.join(cwd, 'build');        // 最终生成的可执行文件

// 打包后的文件位置
export const output = {
  mac: path.join(build, 'mac'),            // mac
  macArm64: path.join(build, 'mac-arm64'), // mac-arm64
  win: path.join(build, 'win'),            // win64
  win32: path.join(build, 'win32'),        // win32
  linux: path.join(build, 'linux')         // linux
};

export const unpacked = {
  mac: path.join(output.mac, 'mac'),
  macArm64: path.join(output.macArm64, 'mac-arm64'),
  win: path.join(output.win, 'win-unpacked'),
  win32: path.join(output.win32, 'win-ia32-unpacked'),
  linux: path.join(output.linux, 'linux-unpacked')
};