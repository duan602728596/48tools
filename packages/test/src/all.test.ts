import { test } from '@playwright/test';
import * as indexTest from './tests/index.test.js';
import * as pocket48RecordTest from './tests/pocket48Record.test.js';

test.describe.serial('48tools e2e test', function(): void {
  test.describe(indexTest.title, indexTest.callback);
  test.describe(pocket48RecordTest.title, pocket48RecordTest.callback);
});