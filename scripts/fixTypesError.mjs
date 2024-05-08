import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd } from './utils.mjs';

const reduxToolkitPath = path.join(cwd, 'node_modules/@reduxjs/toolkit');

async function fixTypesError() {
  // 修复useRef未传递初始参数的错误的问题
  const buildHooksFilePath = path.join(reduxToolkitPath, 'src/query/react/buildHooks.ts');
  const buildHooksFile = await fsP.readFile(buildHooksFilePath, { encoding: 'utf8' });
  const newBuildHooksFile = buildHooksFile.replaceAll(/useRef<[a-zA-Z0-9<>]+(\s*\|\s*undefined)?>\(\)/g, (x) => {
    return x.replace(/\(\)/, '(undefined)');
  });

  await fsP.writeFile(buildHooksFilePath, newBuildHooksFile, { encoding: 'utf8' });

  // 修复rc-util中对于createRoot的引用问题
  // https://github.com/ant-design/ant-design/issues/48709
  const renderFilePath = path.join(cwd, 'node_modules/rc-util/es/React/render.js');
  const renderFileArray = (await fsP.readFile(renderFilePath, { encoding: 'utf8' })).split('\n');

  renderFileArray.unshift('import { createRoot as _createRoot } from "react-dom/client";');
  renderFileArray.forEach((item, index) => {
    if (item.includes('_objectSpread({}, ReactDOM)')) {
      renderFileArray[index] = item.replace('_objectSpread({}, ReactDOM)', '_objectSpread({}, ReactDOM, { createRoot: _createRoot })');
    }
  });

  await fsP.writeFile(renderFilePath, renderFileArray.join('\n'), { encoding: 'utf8' });
}

fixTypesError();