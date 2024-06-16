import * as process from 'node:process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

/* 模块帮助 */
export const require: NodeRequire = createRequire(import.meta.url);

export interface MetaHelperResult {
  __filename: string;
  __dirname: string;
}

export function metaHelper(metaUrl: string): MetaHelperResult {
  const filename: string = fileURLToPath(metaUrl);
  const dirname: string = path.dirname(filename);

  return { __filename: filename, __dirname: dirname };
}

const { __dirname }: MetaHelperResult = metaHelper(import.meta.url);

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* 判断是否是测试环境 */
export const isTest: boolean = process.env.TEST === 'true';

/* 文件夹路径 */
export const wwwPath: string = path.join(__dirname, '..');

/* 判断是否是Windows系统和ARM架构 */
export const isWindowsArm: boolean = process.platform === 'win32' && process.arch === 'arm64';

/**
 * worker.js文件路径
 * 有asar文件：app.asar.unpacked
 * 无asar文件：app
 */
export const workerProductionBasePath: string = path.join(process.resourcesPath, 'app/boot');

/* 图标文件 */
export const titleBarIcon: string | undefined = isDevelopment ? undefined : path.join(wwwPath, 'titleBarIcon.png');

/**
 * html路径
 * @param { string } htmlName - 文件名
 */
export function createHtmlFilePath(htmlName: string): string {
  return isDevelopment
    ? path.join(wwwPath, `../48tools/dist/${ htmlName }.html`)
    : path.join(wwwPath, `view/${ htmlName }.html`);
}

/* 生成initialState */
export function initialState(value: any): string {
  return encodeURIComponent(JSON.stringify(value));
}

/* 获取package.json文件的位置 */
export const packageJson: any = require(path.join(wwwPath, 'package.json'));

/* User-Agent */
export const pcUserAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.68';