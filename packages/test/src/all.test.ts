import { test } from '@playwright/test';
import * as indexTest from './tests/index.test.js';
import * as pocket48RecordTest from './tests/pocket48Record.test.js';
import * as fortyEightInVideo from './tests/48InVideo.test.js';
import * as bilibiliDownload from './tests/bilibiliDownload.test.js';
import * as acfunDownload from './tests/acfunDownload.test.js';

test.describe.serial('48tools e2e test', function(): void {
  test.describe(indexTest.title, indexTest.callback);
  test.describe(pocket48RecordTest.title, pocket48RecordTest.callback);
  test.describe(fortyEightInVideo.title, fortyEightInVideo.callback);
  test.describe(bilibiliDownload.title, bilibiliDownload.callback);
  test.describe(acfunDownload.title, acfunDownload.callback);
});