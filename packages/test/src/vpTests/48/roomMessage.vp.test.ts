import { test, expect } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle, vpImage } from '../../utils/testUtils.js';
import testIdClick from '../../actions/testIdClick.js';
import * as TestId from '../../TestId.js';

/* 口袋48房间消息 */
export const title: string = 'VP 48 Room Message Page';

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
  async function Pocket48RoomMessageVPTest(isDark?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, '48-room-message');
    await app.win.waitForSelector('.ant-pagination');
    await expect(app.win).toHaveScreenshot(vpImage('48', 'pocket48-room-message', isDark));
  }

  test(testTitle(TestId.Pocket48RoomMessageVP.Light, 'pocket48 room message'), async function(): Promise<void> {
    await Pocket48RoomMessageVPTest();

    // 为下一个测试用例做修改
    dark = true;
  });

  test(testTitle(TestId.Pocket48RoomMessageVP.Dark, 'pocket48 room message dark mode'), async function(): Promise<void> {
    await Pocket48RoomMessageVPTest(true);
  });
}