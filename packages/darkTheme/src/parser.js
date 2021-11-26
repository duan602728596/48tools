import { promises as fsP } from 'node:fs';
import path from 'node:path';
import typescript from 'typescript';

/**
 * 分析NodeObject
 * @param { typescript.NodeArray<typescript.Statement> } statements
 * @return { Array<string> }
 */
function resolveNodeObject(statements) {
  const components = [];

  for (const nodeObject of statements) {
    if (nodeObject?.moduleSpecifier?.text === 'antd') {
      const elements = nodeObject.importClause.namedBindings.elements;

      elements.forEach((element) => components.push(element.name.escapedText));
    }
  }

  return components;
}

/**
 * 根据ast解析、提取组件名称
 * @param { string } cwd: 目录
 * @param { Array<string> } files: 文件名
 */
async function parser(cwd, files) {
  // 提取组件名称
  let components = ['Pagination', 'Empty'];

  for (const file of files) {
    const fileName = path.join(cwd, file);
    const code = await fsP.readFile(fileName, { encoding: 'utf8' });
    const sourceFile = typescript.createSourceFile(fileName, code, typescript.ScriptTarget.Latest);

    components = components.concat(resolveNodeObject(sourceFile.statements));
  }

  return Array.from(new Set(components));
}

export default parser;