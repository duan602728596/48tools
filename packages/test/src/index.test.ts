import { test, expect } from '@playwright/test';
import ElectronApp from './utils/ElectronApp.js';

let app: ElectronApp;

test.beforeAll(async function(): Promise<void> {
  app = new ElectronApp();
  await app.init();
});

test.afterAll(async function(): Promise<void> {
  await app.close();
});

test.describe('Index Page', function(): void {
  test('Will display 4 navs', async function(): Promise<void> {
    await app.win.waitForSelector('nav');

    const imageLength: number = await app.win.evaluate(function(): number {
      const navs: NodeListOf<HTMLElement> = document.querySelectorAll('nav');

      return navs.length;
    });

    expect(imageLength).toBe(4);
  });

  test('Will display 2 images', async function(): Promise<void> {
    await app.win.waitForSelector('.ant-image');

    const imageLength: number = await app.win.evaluate(function(): number {
      const antImages: NodeListOf<HTMLElement> = document.querySelectorAll('.ant-image');

      return antImages.length;
    });

    expect(imageLength).toBe(2);
  });
});