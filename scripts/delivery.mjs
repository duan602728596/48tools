import path from 'node:path';
import { cwd, command } from './utils.mjs';

/* 完整的编译步骤 */
async function delivery() {
  await command('npm', ['run', 'build'], path.join(cwd, 'packages/darkTheme'));
  await command('npm', ['run', 'build'], path.join(cwd, 'packages/main'));
  await command('npm', ['run', 'build'], path.join(cwd, 'packages/48tools'));
  await command('node', ['./scripts/unpack.mjs'], cwd);
  await command('node', ['./scripts/clean.mjs'], cwd);
}

delivery();