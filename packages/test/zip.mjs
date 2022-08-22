import util from 'node:util';
import path from 'node:path';
import zip from 'cross-zip';
import { metaHelper } from '@sweet-milktea/utils';

export const { __dirname } = metaHelper(import.meta.url);

const zipPromise = util.promisify(zip.zip);

await zipPromise(
  path.join(__dirname, 'dist/media'),
  path.join(__dirname, 'dist/media.zip')
);