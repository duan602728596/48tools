const path = require('path');
const { promises: fsP } = require('fs');
const { promisify } = require('util');
const glob = require('glob');
const _ = require('lodash');
const matchComponents = require('./matchComponents');
const { lessFile, lessRender } = require('./lessFile');

const globP = promisify(glob);

/* 提取antd的less路径并生成css文件 */
async function main() {
  // 获取所有的tsx文件
  const cwd48tools = path.join(__dirname, '../../48tools/src');
  const files = await globP('**/*.tsx', {
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
  const hljsPath = path.join(require.resolve('highlight.js'), '../..', 'styles/atom-one-dark.css');
  const hljsCss = await fsP.readFile(hljsPath, { encoding: 'utf8' });

  await fsP.mkdir(distDir);
  await fsP.writeFile(path.join(distDir, 'antd-dark.css'), `${ css }\n${ hljsCss }`);
}

main();