import { test, expect } from '@playwright/test';
import type { Locator, ElementHandle } from 'playwright';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { testTitle } from '../../utils/testUtils.js';

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
   * @param { `${ string }48` } liveType
   */
  async function getTeamsVideoData(liveType: `${ string }48`): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, '48-in-video-link');

    // 选择团队
    await selectItemClick(app, 'bilibili-download-live-type', liveType);

    // 加载数据
    const loadDataBtn: Locator = await app.win.locator('.ant-space-item button');

    await loadDataBtn.click();
    await app.win.waitForSelector('.ant-table-row');

    const images: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(images.length).toEqual(15);
  }

  test(testTitle(21, 'Should get SNH48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('SNH48');
  });

  test(testTitle(22, 'Should get BEJ48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('BEJ48');
  });

  test(testTitle(23, 'Should get GNZ48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('GNZ48');
  });

  test(testTitle(24, 'Should get CKG48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('CKG48');
  });
}