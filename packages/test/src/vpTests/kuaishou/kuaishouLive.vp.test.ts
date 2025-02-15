import { test, expect } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, vpImage } from '../../utils/testUtils.js';
import testIdClick from '../../actions/testIdClick.js';
import * as TestId from '../../TestId.js';

/* 快手直播抓取 */
export const title: string = 'VP kuaishou live Page';

export function callback(): void {
  let app: ElectronApp | null = null;
  let dark: boolean = false;

  test.beforeEach(async function(): Promise<void> {
    app = new ElectronApp();
    await app.init({ dark });
  });

  test.afterEach(async function(): Promise<void> {
    await app!.close();
    app = null;
  });

  // 测试
  async function kuaishouLiveVPTest(isDark?: boolean): Promise<void> {
    if (!app) throw new Error('app is null');

    await testIdClick(app, 'kuaishou-live-link');
    await Promise.all([
      app.win.waitForSelector('div header'),
      app.win.waitForSelector('.ant-table')
    ]);
    await expect(app.win).toHaveScreenshot(vpImage('kuaishou', 'kuaishouLive', isDark));
  }

  test(testTitle(TestId.KuaishouLiveVP.Light, 'kuaishou live page'), async function(): Promise<void> {
    await kuaishouLiveVPTest();

    // 为下一个测试用例做修改
    dark = true;
  });

  test(testTitle(TestId.KuaishouLiveVP.Dark, 'kuaishou live page dark mode'), async function(): Promise<void> {
    await kuaishouLiveVPTest(true);
  });
}