import fs, { promises as fsPromoses } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { configsCache } from './config.js';

/**
 * 生成测试的title
 * @param { number } serialNumber - 编号
 * @param { string } title - 标题
 */
export function testTitle(serialNumber: number, title: string): string {
  return `[${ serialNumber }]${ title }`;
}

/**
 * 输出log
 * @param { number } serialNumber - 编号
 * @param { string } title - 标题
 */
export function testLog(serialNumber: number, title: string): void {
  console.log(testTitle(serialNumber, title));
}

/**
 * 生成vp测试的图片
 * @param { string } dir - 目录
 * @param { string } filename - 文件名
 * @param { boolean } [dark] - 暗黑模式文件
 */
export function vpImage(dir: string, filename: string, dark?: boolean): Array<string> {
  return [os.platform(), dir, `${ filename }${ dark ? '-dark' : '' }.png`];
}

/**
 * 读取文件
 * @param { string } filename - 文件地址
 */
export function readConfigsCacheFile(filename: string): Promise<string> | undefined {
  const file: string = path.join(configsCache, filename);

  if (fs.existsSync(file)) {
    return fsPromoses.readFile(file, 'utf-8');
  }
}