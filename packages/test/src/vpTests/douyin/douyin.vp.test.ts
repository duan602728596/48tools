import { test, expect } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, vpImage } from '../../utils/testUtils.js';
import testIdClick from '../../actions/testIdClick.js';
import * as TestId from '../../TestId.js';

/* 抖音 */
export const title: string = 'VP douyin Page';

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
  async function douyinVPTest(isDark?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'douyin-download-link');
    await Promise.all([
      app.win.waitForSelector('div header'),
      app.win.waitForSelector('.ant-alert')
    ]);
    await expect(app.win).toHaveScreenshot(vpImage('douyin', 'douyin', isDark));
  }

  test(testTitle(TestId.DouyinDownloadVP.Light, 'douyin page'), async function(): Promise<void> {
    await douyinVPTest();

    // 为下一个测试用例做修改
    dark = true;
  });

  test(testTitle(TestId.DouyinDownloadVP.Dark, 'douyin page dark mode'), async function(): Promise<void> {
    await douyinVPTest(true);
  });
}