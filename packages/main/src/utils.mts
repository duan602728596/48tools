import { env, resourcesPath } from 'node:process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import Module from 'node:module';
import { readFileSync } from 'node:fs';

/* 模块帮助 */
export const nodeModulesRequire: NodeRequire = Module['createRequire'](globalThis.__IMPORT_META_URL__ ?? import.meta.url);

export interface MetaHelperResult {
  __filename: string;
  __dirname: string;
}

export function metaHelper(metaUrl: string): MetaHelperResult {
  const filename: string = fileURLToPath(metaUrl);
  const dirname: string = path.dirname(filename);

  return { __filename: filename, __dirname: dirname };
}

const { __dirname }: MetaHelperResult = metaHelper(globalThis.__IMPORT_META_URL__ ?? import.meta.url);

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = env.NODE_ENV === 'development';

/* 判断是否是测试环境 */
export const isTest: boolean = env.TEST === 'true';

/* 文件夹路径 */
export const wwwPath: string = path.join(__dirname, '..');

/* view文件 */
export const viewDir: string = path.join(wwwPath, isDevelopment ? '../48tools/dist' : 'view');

/* help文件 */
export const helpDir: string = isDevelopment
  ? path.join(__dirname, '../../help/dist')
  : path.join(resourcesPath, 'app/help');

/**
 * worker.js文件路径
 * 有asar文件：app.asar.unpacked
 * 无asar文件：app
 */
export const workerProductionBasePath: string = path.join(resourcesPath, 'app/boot');

/* 图标文件 */
export const titleBarIcon: string | undefined = isDevelopment ? undefined : path.join(wwwPath, 'titleBarIcon.png');

/**
 * html路径
 * @param { string } htmlName - 文件名
 */
export function createHtmlFilePath(htmlName: string): string {
  return path.join(viewDir, `${ htmlName }.html`);
}

/* 生成initialState */
export function createInitialState(value: Record<string, any>): string {
  return encodeURIComponent(JSON.stringify(value));
}

/* 获取package.json文件 */
export const packageJson: { version: string } = JSON.parse(readFileSync(path.join(wwwPath, 'package.json'), { encoding: 'utf-8' }));

/* User-Agent */
export const pcUserAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0';