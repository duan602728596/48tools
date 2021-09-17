import path from 'path';
import { promises as fsP } from 'fs';
import { promisify } from 'util';
import glob from 'glob';
import _ from 'lodash';
import { metaHelper, moduleExists } from '@sweet-milktea/utils';
import matchComponents from './matchComponents.js';
import { lessFile, lessRender } from './lessFile.js';

const globPromise = promisify(glob);
const { __dirname } = metaHelper(import.meta.url);

/* 提取antd的less路径并生成css文件 */
async function main() {
  // 获取所有的tsx文件
  const cwd48tools = path.join(__dirname, '../../48tools/src');
  const files = await globPromise('**/*.tsx', {
    cwd: cwd48tools
  });

  // 提取组件名称
  let allComponents = ['Pagination', 'Empty'];

  for (const file of files) {
    const components = await matchComponents(cwd48tools, file);

    if (components) {
      allComponents.push(...components);
    }
  }

  allComponents = _.uniq(allComponents);

  // 生成less文件
  const componentsLessFiles = lessFile(allComponents);
  const css = await lessRender(componentsLessFiles);
  const distDir = path.join(__dirname, '../dist');

  // 代码高亮的暗黑主题样式
  const hljsPath = path.join(moduleExists('highlight.js'), '../..', 'styles/atom-one-dark.css');
  const hljsCss = await fsP.readFile(hljsPath, { encoding: 'utf8' });

  await fsP.mkdir(distDir);
  await fsP.writeFile(path.join(distDir, 'dark-theme.css'), `${ css }\n${ hljsCss }`);
}

main();