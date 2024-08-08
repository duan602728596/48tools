import { test, expect } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, vpImage } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';

/* 口袋48 */
export const title: string = 'VP 48 Page';

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
  async function liveOptionsVPTest(isDark?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await app.win.locator('.ant-btn').nth(0).click();
    await app.win.locator('.ant-btn-group a.ant-btn').nth(0).click();
    await app.win.waitForSelector('.ant-form');
    await expect(app.win).toHaveScreenshot(vpImage('48', 'pocket48-live-options', isDark));
  }

  test(testTitle(TestId.Live48OptionsVP.Light, 'pocket48 live options page'), async function(): Promise<void> {
    await liveOptionsVPTest();

    // 为下一个测试用例做修改
    dark = true;
  });

  test(testTitle(TestId.Live48OptionsVP.Dark, 'pocket48 live options page dark mode'), async function(): Promise<void> {
    await liveOptionsVPTest(true);
  });
}