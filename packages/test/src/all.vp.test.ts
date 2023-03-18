import { test } from '@playwright/test';
import * as indexVPTest from './vpTests/index/index.vp.test.js';

test.describe.parallel('48tools vp test', function(): void {
  test.describe.serial(indexVPTest.title, indexVPTest.callback);
});