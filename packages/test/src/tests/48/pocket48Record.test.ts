import { test, expect, type Locator, type ElementHandle } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import { testTitle } from '../../utils/testUtils.js';

/* 口袋48录播下载测试 */
export const title: string = '48/Pocket48Record Page';

export function callback(): void {
  let app: ElectronApp | null = null;

  test.beforeEach(async function(): Promise<void> {
    app = new ElectronApp();
    await app.init();
  });

  test.afterEach(async function(): Promise<void> {
    await app!.close();
    app = null;
  });

  test(testTitle(25, 'Should get record data'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'pocket48-record-link');

    // 测试能够正常加载数据
    await app.win.waitForSelector('.ant-table-wrapper');

    const antBtn: Locator = await app.win.locator('.ant-btn');

    await antBtn.nth(2).click();
    await app.win.waitForSelector('.ant-table-row');

    const rows: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(rows.length).toEqual(10);
  });

  test(testTitle(26, 'Should search record data'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'pocket48-record-link');

    // 测试能够正常加载数据
    await Promise.all([
      app.win.waitForSelector('.ant-table-wrapper'),
      app.win.waitForSelector('#userId')
    ]);

    await app.win.click('#userId');

    /*
    //! keyboard.type无法触发接口查询
    await app.win.keyboard.type('刘倩倩');
    await app.win.waitForTimeout(5_000);

    const selectItem: Locator = await app.win.locator('.ant-select-item[title="刘倩倩（327568）"]');

    await selectItem.click();
    await app.win.waitForTimeout(1_000);
    */
    await app.win.keyboard.type('327568');

    const antBtn: Locator = await app.win.locator('.ant-btn');

    await antBtn.nth(2).click();
    await app.win.waitForSelector('.ant-table-row');

    const rows: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(rows.length).toEqual(10);
  });
}