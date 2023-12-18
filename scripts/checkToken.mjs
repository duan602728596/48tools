import fs from 'node:fs/promises';
import path from 'node:path';
import { cwd } from './utils.mjs';

async function checkTestConfigFile(NIMTestDir) {
  const testFile = path.join(cwd, 'packages/test/src/testConfig.ts');
  const file = await fs.readFile(testFile, { encoding: 'utf8' });

  if (/cookie: '/g.test(file)) {
    throw new Error('有敏感信息。');
  }
}

async function checkToken() {
  await checkTestConfigFile();
}

checkToken();