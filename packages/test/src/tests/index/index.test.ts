import { test, expect } from '@playwright/test';
import type { ElementHandle } from 'playwright';
import type { ElementHandleForTag } from 'playwright-core/types/structs';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle } from '../../utils/testUtils.js';

/* 客户端主界面入口测试 */
export const title: string = 'index Page';

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

  test(testTitle(11, 'Should render navs and images'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await Promise.all([
      app.win.waitForSelector('nav', { state: 'attached' }),
      app.win.waitForSelector('.ant-image', { state: 'attached' })
    ]);

    // 测试导航的正常显示
    const navs: Array<ElementHandleForTag<'nav'>> = await app.win.$$('nav');

    expect(navs.length).toEqual(4);

    // 测试二维码图片的正常显示
    const images: Array<ElementHandle> = await app!.win.$$('.ant-image');

    expect(images.length).toEqual(2);
  });
}