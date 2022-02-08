import * as process from 'node:process';
import * as path from 'node:path';

/* 判断是开发环境还是生产环境 */
export const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* 文件夹路径 */
export const wwwPath: string = path.join(__dirname, '../..');