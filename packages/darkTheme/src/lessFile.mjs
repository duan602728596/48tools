import path from 'path';
import less from 'less';
import { moduleExists } from '@sweet-milktea/utils';

/**
 * 驼峰转连字符
 * @param { string } str: 字符
 */
function camelCaseToHyphen(str) {
  const result = [];
  let cache = null;

  for (let i = 0, j = str.length, k = j - 1; i < j; i++) {
    // 判断是大写
    if (/[A-Z]/.test(str[i])) {
      if (cache !== null) {
        result.push(cache);
      }

      cache = str[i].toLocaleLowerCase();
    } else {
      cache += str[i];
    }

    if (i === k) {
      result.push(cache);
    }
  }

  return result.join('-');
}

/**
 * 生成less文件
 * @param { Array<string> } allComponents: 组件名称
 */
export function lessFile(allComponents) {
  const antd = path.join(moduleExists('antd'), '../../es');
  const componentsLessFiles = allComponents.map((o) => {
    const name = /^[a-z]/.test(o) ? o : camelCaseToHyphen(o);

    return path.join(antd, name, 'style/index.less');
  });

  componentsLessFiles.unshift(path.join(antd, 'style/dark.less'));

  return componentsLessFiles;
}

/**
 * 生成less代码
 * @param { Array<string> } componentsLessFiles: less文件的数组
 */
export async function lessRender(componentsLessFiles) {
  const lessInput = componentsLessFiles.map((o) => {
    return `@import '${ o }';`;
  }).join('\n');

  const output = await less.render(lessInput, {
    javascriptEnabled: true,
    modifyVars: {
      '@primary-color': '#13c2c2'
    }
  });

  return output.css;
}