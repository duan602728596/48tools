import { test, expect } from '@playwright/test';
import type { Locator, ElementHandle } from 'playwright';
import ElectronApp from '../utils/ElectronApp.js';
import testIdClick from '../actions/testIdClick.js';

/* 48官方公演录播下载测试 */
export const title: string = '48/InVideo Page';

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

  /**
   * 选择team并加载对应的视频
   * @param { number } index
   */
  async function getTeamsVideoData(index: number): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, '48-in-video-link');

    // 选择团队
    const changeTeamSelect: Locator = await app.win.locator('.ant-select');

    await changeTeamSelect.click();

    const selectItem: Locator = await app.win.locator('.ant-select-item');

    await selectItem.nth(index).click();
    await app.win.waitForTimeout(1_500);

    // 加载数据
    const loadDataBtn: Locator = await app.win.locator('.ant-space-item button');

    await loadDataBtn.click();
    await app.win.waitForSelector('.ant-table-row');

    const images: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(images.length).toEqual(15);
  }

  test('Should get SNH48 public performance video data', async function(): Promise<void> {
    await getTeamsVideoData(0);
  });

  test('Should get BEJ48 public performance video data', async function(): Promise<void> {
    await getTeamsVideoData(1);
  });

  test('Should get GNZ48 public performance video data', async function(): Promise<void> {
    await getTeamsVideoData(2);
  });

  test('Should get CKG48 public performance video data', async function(): Promise<void> {
    await getTeamsVideoData(3);
  });
}