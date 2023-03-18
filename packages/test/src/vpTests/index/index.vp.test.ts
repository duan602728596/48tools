import { test, expect } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, vpImage } from '../../utils/testUtils.js';

/* 客户端主界面入口测试 */
export const title: string = 'VP index Page';

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
  async function indexVPTest(isDark?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await Promise.all([
      app.win.waitForSelector('nav', { state: 'attached' }),
      app.win.waitForSelector('.ant-image', { state: 'attached' })
    ]);
    await expect(app.win).toHaveScreenshot(vpImage('index', isDark ? 'index-dark' : 'index'));
  }

  test(testTitle(1000, 'index page'), async function(): Promise<void> {
    await indexVPTest();

    // 为下一个测试用例做修改
    dark = true;
  });

  test(testTitle(1001, 'index page dark mode'), async function(): Promise<void> {
    await indexVPTest(true);
  });
}