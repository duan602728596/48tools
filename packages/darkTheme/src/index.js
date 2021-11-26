import path from 'node:path';
import { promises as fsP } from 'node:fs';
import { promisify } from 'node:util';
import glob from 'glob';
import { metaHelper, moduleExists } from '@sweet-milktea/utils';
import parser from './parser.js';
import lessCode from './lessCode.js';

const globPromise = promisify(glob);
const { __dirname } = metaHelper(import.meta.url);

/* 提取antd的less路径并生成css文件 */
async function main() {
  // 获取所有的tsx文件
  const cwd48tools = path.join(__dirname, '../../48tools/src');
  const files = await globPromise('**/*.tsx', { cwd: cwd48tools });

  // 查找antd组件
  const antdComponents = await parser(cwd48tools, files);

  // 生成less文件
  const css = await lessCode(antdComponents);
  const distDir = path.join(__dirname, '../dist');

  // 代码高亮的暗黑主题样式
  const hljsPath = path.join(moduleExists('highlight.js'), '../..', 'styles/atom-one-dark.css');
  const hljsCss = await fsP.readFile(hljsPath, { encoding: 'utf8' });

  await fsP.mkdir(distDir);
  await fsP.writeFile(path.join(distDir, 'dark-theme.css'), `/*! @48tools 暗黑模式css文件 !*/\n${ css }\n${ hljsCss }`);
}

main();