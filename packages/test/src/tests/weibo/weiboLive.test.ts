import path from 'node:path';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { test, expect, type ElementHandle, type Locator } from '@playwright/test';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import * as config from '../../utils/config';
import ElectronApp from '../../utils/ElectronApp';
import { testTitle } from '../../utils/testUtils.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions';
import testIdClick from '../../actions/testIdClick';

/* 微博直播测试 */
export const title: string = 'WeiboLive Page';

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

  test(testTitle(60, 'Should get weibo live video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.weiboDir, 'weibo-live.flv');

    await fse.ensureDir(config.weiboDir);
    await mockShowSaveDialog(app, downloadVideoPath);
    await setFFmpegPath(app);
    await testIdClick(app, 'weibo-live-link');
    await app.win.click('#liveValue');
    await app.win.keyboard.type('1022:2321325021334517186741');

    const antBtn: Locator = await app.win.locator('.ant-btn');

    await antBtn.nth(1).click();
    await setTimeoutPromise(10_000);
    await app.win.waitForSelector('.ant-table-row');
    await app.win.locator('.ant-table-row .ant-btn-dangerous').nth(0).click();
    await app.win.locator('.ant-popconfirm-buttons .ant-btn-primary').click();

    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}