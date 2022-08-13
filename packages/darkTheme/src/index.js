import path from 'node:path';
import fs, { promises as fsP } from 'node:fs';
import { promisify } from 'node:util';
import glob from 'glob';
import postcss from 'postcss';
import { metaHelper } from '@sweet-milktea/utils';
import typescriptParser from './typescriptParser.js';
import lessCode from './lessCode.js';
import postcssRemoveNoColorRulesPlugin from './postcssPlugins/removeNoColorRulesPlugin.js';
import postcssRemoveExcessSelectorPlugin from './postcssPlugins/removeExcessSelectorPlugin.js';

const globPromise = promisify(glob);
const { __dirname } = metaHelper(import.meta.url);

/**
 * 使用postcss移除多余的css属性，只保留颜色
 * @param { string } css
 */
async function removeExcessCss(css) {
  const result = await postcss([
    postcssRemoveNoColorRulesPlugin,
    postcssRemoveExcessSelectorPlugin
  ]).process(css, { from: undefined });

  return result.css;
}

/**
 * 生成less文件
 * @param { string } distDir
 * @param { Array<string> } antdComponents
 * @param { boolean } isDark: 是否是暗色主题
 */
async function createLessFile(distDir, antdComponents, isDark) {
  const css = await lessCode(antdComponents, isDark);

  if (!fs.existsSync(distDir)) {
    await fsP.mkdir(distDir);
  }

  await fsP.writeFile(
    path.join(distDir, isDark ? 'dark-theme.css' : 'light-theme.css'),
    `/*! @48tools ${ isDark ? '暗黑模式' : '浅色模式' }css文件 !*/\n${ await removeExcessCss(css) }\n`
  );
}

/* 提取antd的less路径并生成css文件 */
async function main() {
  // 获取所有的tsx文件
  const cwd48tools = path.join(__dirname, '../../48tools/src');
  const files = await globPromise('**/*.tsx', { cwd: cwd48tools });

  // 查找antd组件
  const antdComponents = await typescriptParser(cwd48tools, files);

  // 生成less文件
  const distDir = path.join(__dirname, '../dist');

  await createLessFile(distDir, antdComponents, true);
}

main();