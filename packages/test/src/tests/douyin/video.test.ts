import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { test, expect, type ElementHandle } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle } from '../../utils/testUtils.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';

/* 视频下载测试 */
export const title: string = 'Douyin/Video download';

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
  async function queryVideo(text: string, select: string): Promise<Array<ElementHandle>> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'douyin-download-link');
    await app.win.type('.ant-input', text);
    await app.win.click('.ant-input-search-with-button .ant-btn');
    await selectItemClick(app, await app.win.locator('.ant-modal-body .ant-select'), select);
    await app.win.click('.ant-modal-footer .ant-btn-primary');
    await setTimeoutPromise(2_000);

    await app.win.waitForSelector('.ant-table-row');

    const rows: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    return rows;
  }

  test(testTitle(51, 'Should get video by full url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo(
      'https://www.douyin.com/video/7207875630820527416', '下载地址-3(1080*1920)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(52, 'Should get video by video id'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo('7199998424823991556', '下载地址-3(1920*1080)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(53, 'Should get video by share url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo('https://v.douyin.com/StBFgWn/', '下载地址-3(1080*1920)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(54, 'Should get images by full url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo(
      'https://www.douyin.com/note/7144312918660746508', '图片地址-3(1440*1920)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(55, 'Should get images by note id'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo('7081995835235519756', '图片地址-3(1080*1438)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });

  test(testTitle(56, 'Should get images by share url'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const rows: Array<ElementHandle> = await queryVideo('https://v.douyin.com/StwKB7s/', '图片地址-3(1440*1920)');

    await setTimeoutPromise(10_000);
    expect(rows.length).toEqual(1);
  });
}