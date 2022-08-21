import { test } from '@playwright/test';
import * as indexTest from './tests/index.test.js';
import * as pocket48RecordTest from './tests/48/pocket48Record.test.js';
import * as fortyEightInVideo from './tests/48/48InVideo.test.js';
import * as bilibiliDownload from './tests/bilibili/bilibiliDownload.test.js';
import * as bilibiliLive from './tests/bilibili/bilibiliLive.test.js';
import * as acfunDownload from './tests/acfun/acfunDownload.test.js';
import * as acfunLive from './tests/acfun/acfunLive.test.js';

test.describe.serial('48tools e2e test', function(): void {
  test.describe(indexTest.title, indexTest.callback);
  test.describe(pocket48RecordTest.title, pocket48RecordTest.callback);
  test.describe(fortyEightInVideo.title, fortyEightInVideo.callback);
  test.describe(bilibiliDownload.title, bilibiliDownload.callback);
  test.describe(bilibiliLive.title, bilibiliLive.callback);
  test.describe(acfunDownload.title, acfunDownload.callback);
  test.describe(acfunLive.title, acfunLive.callback);
});