import { setTimeout as setTimeoutPromise } from 'timers/promises';
import { test, expect, type ElementHandle } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, testLog } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';
import testIdClick from '../../actions/testIdClick.js';
import { testConfig } from '../../testConfig.js';
import { setKuaishouCookie } from '../../actions/utilActions.js';

/* 快手视频下载测试 */
export const title: string = 'Kuaishou/Download Page';

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

  // 输入并查询视频
  async function queryVideo(text: string): Promise<Array<ElementHandle>> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'kuaishou-download-link');
    await app.win.fill('.ant-input', text);
    await app.win.click('.ant-input-search-with-button .ant-btn');
    await app.win.waitForSelector('.ant-table-row');

    const rows: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    return rows;
  }

  test(testTitle(TestId.KuaishouDownload.GetKuaishouVideo, 'Should get kuaishou video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    if (!testConfig.kuaishou.cookie) {
      testLog(TestId.KuaishouDownload.GetKuaishouVideo, 'Do not run test because no kuaishou cookie');
      test.skip();
    } else {
      await setKuaishouCookie(app);
    }

    const rows: Array<ElementHandle> = await queryVideo('3xicnphhayfdyxs');

    await setTimeoutPromise(2_000);
    expect(rows.length).toEqual(1);
  });
}