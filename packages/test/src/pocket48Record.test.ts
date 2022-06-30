import { test, expect } from '@playwright/test';
import type { Locator, ElementHandle } from 'playwright';
import ElectronApp from './utils/ElectronApp.js';

/* 口袋48录播下载测试 */
test.describe('48/Pocket48Record Page', function(): void {
  let app: ElectronApp;

  test.beforeAll(async function(): Promise<void> {
    app = new ElectronApp();
    await app.init();
  });

  test.afterAll(async function(): Promise<void> {
    await app.close();
  });

  test('Should get record data', async function(): Promise<void> {
    const navBtn: Locator = await app.win.locator('[data-test-id=pocket48-record-link]');

    await navBtn.click();

    // 测试能够正常加载数据
    await app.win.waitForSelector('.ant-table-wrapper');

    const antBtn: Locator = await app.win.locator('.ant-btn');

    await antBtn.nth(2).click();
    await app.win.waitForSelector('.ant-table-row');

    const images: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(images.length).toEqual(10);
  });
});