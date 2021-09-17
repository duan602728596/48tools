import { promises as fsP } from 'node:fs';
import path from 'node:path';

/**
 * 解析、提取组件名称
 * @param { string } cwd: 目录
 * @param { string } filePath: 文件名
 */
async function matchComponents(cwd, filePath) {
  const data = await fsP.readFile(path.join(cwd, filePath), { encoding: 'utf8' });
  const antdStr = data.match(/import\s*\{[a-zA-Z,\s]+\}\s*from\s*['"]antd['"];/ig); // 提取文字

  if (!antdStr) {
    return;
  }

  const componentsName = antdStr[0].match(/\{[a-zA-Z,\s]+\}/ig); // 提取组件名称
  const components = componentsName[0]
    .replace(/^\{\s*/, '')
    .replace(/\s*\}$/, '')
    .split(/\s*\,\s*/);

  return components;
}

export default matchComponents;