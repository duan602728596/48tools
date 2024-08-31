import path from 'node:path';
import { cwd, command, npm } from './utils.mjs';

/* 完整的编译步骤 */
async function delivery() {
  await command(npm, ['run', 'build'], path.join(cwd, 'packages/main'));
  await command(npm, ['run', 'build'], path.join(cwd, 'packages/48tools'));
  await command(npm, ['run', 'build'], path.join(cwd, 'packages/help'));
  await command('node', ['--experimental-json-modules', './scripts/unpack.mjs'], cwd);
  await command('node', ['--experimental-json-modules', './scripts/clean.mjs'], cwd);
}

delivery();