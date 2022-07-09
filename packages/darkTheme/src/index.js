import path from 'node:path';
import fs, { promises as fsP } from 'node:fs';
import { promisify } from 'node:util';
import glob from 'glob';
import { metaHelper, moduleExists } from '@sweet-milktea/utils';
import parser from './parser.js';
import lessCode from './lessCode.js';

const globPromise = promisify(glob);
const { __dirname } = metaHelper(import.meta.url);

/**
 * 生成less文件
 * @param { string } distDir
 * @param { Array<string> } antdComponents
 * @param { boolean } isDark: 是否是暗色主题
 */
async function createLessFile(distDir, antdComponents, isDark) {
  const css = await lessCode(antdComponents, isDark);
  const hljsPath = path.join(
    moduleExists('highlight.js'),
    '../..',
    isDark ? 'styles/atom-one-dark.css' : 'styles/atom-one-light.css'
  );
  const hljsCss = await fsP.readFile(hljsPath, { encoding: 'utf8' });

  if (!fs.existsSync(distDir)) {
    await fsP.mkdir(distDir);
  }

  await fsP.writeFile(
    path.join(distDir, isDark ? 'dark-theme.css' : 'light-theme.css'),
    `/*! @48tools ${ isDark ? '暗黑模式' : '浅色模式' }css文件 !*/\n${ css }\n${ hljsCss }`
  );
}

/* 提取antd的less路径并生成css文件 */
async function main() {
  // 获取所有的tsx文件
  const cwd48tools = path.join(__dirname, '../../48tools/src');
  const files = await globPromise('**/*.tsx', { cwd: cwd48tools });

  // 查找antd组件
  const antdComponents = await parser(cwd48tools, files);

  // 生成less文件
  const distDir = path.join(__dirname, '../dist');

  await Promise.all([
    createLessFile(distDir, antdComponents, false),
    createLessFile(distDir, antdComponents, true)
  ]);
}

main();