import { test, expect, type Locator, type ElementHandle } from '@playwright/test';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { testTitle } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';

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
    await selectItemClick(app, '48-in-video-group-type', liveType);

    // 加载数据
    const loadDataBtn: Locator = await app.win.locator('.ant-btn-group button.ant-btn-primary');

    await loadDataBtn.click();
    await app.win.waitForSelector('.ant-table-row');

    const images: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(images.length).toEqual(20);
  }

  test(testTitle(TestId.SNH48InVideo.SNH48, 'Should get SNH48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('SNH48');
  });

  test(testTitle(TestId.SNH48InVideo.BEJ48, 'Should get BEJ48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('BEJ48');
  });

  test(testTitle(TestId.SNH48InVideo.GNZ48, 'Should get GNZ48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('GNZ48');
  });

  test(testTitle(TestId.SNH48InVideo.CKG48, 'Should get CKG48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('CKG48');
  });

  test(testTitle(TestId.SNH48InVideo.CGT48, 'Should get CGT48 public performance video data'), async function(): Promise<void> {
    await getTeamsVideoData('CGT48');
  });
}