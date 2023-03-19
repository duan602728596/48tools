import { test } from '@playwright/test';
import * as indexVPTest from './vpTests/index/index.vp.test.js';
import * as fortyEightVPTest from './vpTests/48/pocket48.vp.test.js';
import * as douyinVPTest from './vpTests/douyin/douyin.vp.test.js';

test.describe.parallel('48tools vp test', function(): void {
  test.describe.serial(indexVPTest.title, indexVPTest.callback);
  test.describe.serial(fortyEightVPTest.title, fortyEightVPTest.callback);
  test.describe.serial(douyinVPTest.title, douyinVPTest.callback);
});