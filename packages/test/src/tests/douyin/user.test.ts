import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { test, expect, type ElementHandle } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle } from '../../utils/testUtils.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import * as TestId from '../../TestId.js';

/* 视频下载测试 */
export const title: string = 'Douyin/User search';

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

  // 输入并查询用户
  async function queryUser(text: string): Promise<Array<ElementHandle>> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'douyin-download-link');
    await app.win.locator('.ant-input').fill(text);
    await app.win.click('.ant-input-search-with-button .ant-btn');
    await selectItemClick(app, app.win.locator('.ant-modal-body .ant-table-cell .ant-select').nth(0), 0);
    await app.win.click('.ant-modal-footer .ant-btn-default');
    await setTimeoutPromise(2_000);

    await app.win.waitForSelector('.ant-table-row');

    const rows: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    return rows;
  }

  test(testTitle(TestId.DouyinUser.GetUserInfoByFullUrl, 'Should get user info by full url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryUser(
      'https://www.douyin.com/user/MS4wLjABAAAAu9em5FdpmFgYC_6QgtXzWDyE9qMxwq0A9hlFwvExBavnl_xPhXXtVO61gE1NhgP3');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(TestId.DouyinUser.GetUserInfoByUserId, 'Should get user info by user id'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryUser('MS4wLjABAAAAtYUHX7y_z3dgtH4_Bgia4OAJx7O7WlduM6vDemvecMQ');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(TestId.DouyinUser.GetUserInfoByShareUrl, 'Should get user info by share url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryUser('https://v.douyin.com/StAuqGL/');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });
}