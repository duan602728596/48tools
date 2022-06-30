import { test, expect } from '@playwright/test';
import type { ElementHandle } from 'playwright';
import type { ElementHandleForTag } from 'playwright-core/types/structs';
import ElectronApp from '../utils/ElectronApp.js';

/* 客户端主界面入口测试 */
export const title: string = 'Index Page';

export function callback(): void {
  let app: ElectronApp;

  test.beforeAll(async function(): Promise<void> {
    app = new ElectronApp();
    await app.init();
  });

  test.afterAll(async function(): Promise<void> {
    await app.close();
  });

  test('Should render navs and images', async function(): Promise<void> {
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