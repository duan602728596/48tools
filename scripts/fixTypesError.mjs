import path from 'node:path';
import fsP from 'node:fs/promises';
import { cwd } from './utils.mjs';

async function fixTypesError() {
  const filePath = path.join(cwd, 'node_modules/@reduxjs/toolkit/src/query/react/module.ts');
  const file = await fsP.readFile(filePath, { encoding: 'utf8' });

  await fsP.writeFile(filePath, `// @ts-nocheck\n${ file }`, { encoding: 'utf8' });
}

fixTypesError();