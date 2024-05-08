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
}

fixTypesError();