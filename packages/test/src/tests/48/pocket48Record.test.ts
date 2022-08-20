import { test, expect } from '@playwright/test';
import type { Locator, ElementHandle } from 'playwright';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';

/* 口袋48录播下载测试 */
export const title: string = '48/Pocket48Record Page';

export function callback(): void {
  let app: ElectronApp;

  test.beforeEach(async function(): Promise<void> {
    app = new ElectronApp();
    await app.init();
  });

  test.afterEach(async function(): Promise<void> {
    await app.close();
  });

  test('Should get record data', async function(): Promise<void> {
    await testIdClick(app, 'pocket48-record-link');

    // 测试能够正常加载数据
    await app.win.waitForSelector('.ant-table-wrapper');

    const antBtn: Locator = await app.win.locator('.ant-btn');

    await antBtn.nth(2).click();
    await app.win.waitForSelector('.ant-table-row');

    const images: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(images.length).toEqual(10);
  });
}