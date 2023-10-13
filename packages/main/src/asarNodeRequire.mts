import * as path from 'node:path';
import * as process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import 'asar-node';

/* 模块帮助 */
export const require: NodeRequire = createRequire(import.meta.url);
const filename: string = fileURLToPath(import.meta.url);
const dirname: string = path.dirname(filename);

/* 判断是开发环境还是生产环境 */
const isDevelopment: boolean = process.env.NODE_ENV === 'development';
const asarDir: string = path.join(dirname, '../../app.asar');
const asarDirNodeModules: string = path.join(asarDir, 'node_modules');

/**
 * 开发环境在worker中加载模块
 * @param { string } moduleName: 模块名称
 */
function asarNodeDevRequire<T>(moduleName: string): T {
  return require(moduleName);
}

/**
 * 生产环境在worker中加载模块
 * @param { string } moduleName: 模块名称
 */
function asarNodeProRequire<T>(moduleName: string): T {
  return require(path.join(asarDirNodeModules, `${ moduleName }/index.js`));
}

export default isDevelopment ? asarNodeDevRequire : asarNodeProRequire;