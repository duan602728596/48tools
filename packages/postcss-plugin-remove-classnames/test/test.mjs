import test from 'node:test';
import { deepStrictEqual } from 'node:assert/strict';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { metaHelper } from '@sweet-milktea/utils';
import postcss from 'postcss';
import postcssPluginRemoveClassNames from '../lib/index.cjs';

const { __dirname } = metaHelper(import.meta.url);

test('it should remove classnames', async function() {
  const css = await fsPromises.readFile(path.join(__dirname, 'test.css'), { encoding: 'utf-8' });
  const result = await postcss([
    postcssPluginRemoveClassNames.default({ removeClassNames: ['filter'] })
  ]).process(css);

  deepStrictEqual(result.css.includes('--tw-blur'), false);
  deepStrictEqual(result.css.includes('.filter'), false);
  deepStrictEqual(result.css.includes('.text'), true);
});