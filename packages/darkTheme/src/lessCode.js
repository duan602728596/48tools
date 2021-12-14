import path from 'node:path';
import fs from 'node:fs';
import less from 'less';
import { moduleExists } from '@sweet-milktea/utils';

/**
 * 驼峰转连字符
 * @param { string } str: 字符
 */
function camelCaseToHyphen(str) {
  return str.replaceAll(/[A-Z]/g, (s) => `-${ s.toLocaleLowerCase() }`).slice(1);
}

/**
 * 生成less文件
 * @param { Array<string> } antdComponents: 组件名称
 */
function lessImportCode(antdComponents) {
  const antd = path.join(moduleExists('antd'), '../../es');
  const componentsLessFiles = [];

  antdComponents.forEach((o) => {
    const name = /^[a-z]/.test(o) ? o : camelCaseToHyphen(o);
    const file = path.join(antd, name, 'style/index.less');

    if (fs.existsSync(file)) {
      componentsLessFiles.push(file);
    }
  });

  componentsLessFiles.unshift(path.join(antd, 'style/dark.less'));

  return componentsLessFiles;
}

/**
 * 生成less代码
 * @param { Array<string> } antdComponents: antd的组件名称
 */
async function lessCode(antdComponents) {
  const lessImport = lessImportCode(antdComponents);
  const lessInput = lessImport.map((o) => `@import '${ o }';`).join('\n');
  const output = await less.render(lessInput, {
    javascriptEnabled: true,
    modifyVars: {
      '@primary-color': '#13c2c2'
    }
  });

  return output.css;
}

export default lessCode;