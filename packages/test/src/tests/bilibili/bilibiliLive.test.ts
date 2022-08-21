import path from 'node:path';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { test, expect } from '@playwright/test';
import type { JSHandle, Locator, ElementHandle } from 'playwright';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions.js';
import * as config from '../../utils/config.js';
import { getLiveList } from '../../services/services.js';
import type { LiveListResponse } from '../../services/interface.js';

/* B站直播测试 */
export const title: string = 'Bilibili/Live Page';

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

  test('Should get bilibili live video', async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.bilibiliDir, 'bilibili-live.flv');

    await fse.ensureDir(config.bilibiliDir);
    await mockShowSaveDialog(app, downloadVideoPath);

    // 设置ffmpeg的位置
    const [liveList]: [LiveListResponse, JSHandle<void>, void] = await Promise.all([
      getLiveList(),
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'bilibili-live-link');
        await testIdClick(app, 'bilibili-add-live-id-btn');
      })()
    ]);

    // 输入直播间号
    await Promise.all([
      app.win.waitForSelector('#description'),
      app.win.waitForSelector('#roomId')
    ]);
    await app.win.type('#description', 'test1');
    await app.win.type('#roomId', liveList.data.room_list[0].list[0].roomid.toString());
    await app.win.click('.ant-modal-footer button.ant-btn-primary');
    await app.win.waitForTimeout(2_000);

    // 点击开始录制
    const actionBtns: Locator = await app.win.locator('.ant-table-cell button');

    await actionBtns.nth(0).click();
    await setTimeoutPromise(10_000);
    await actionBtns.nth(0).click();
    await app.win.locator('.ant-popover-buttons button.ant-btn-primary').click();

    // Delete
    const actionBtnsHandle: Array<ElementHandle> = await app.win.$$('.ant-table-cell button');

    for (let i: number = actionBtnsHandle.length - 1; i >= 0; i--) {
      if (i % 2 !== 0) {
        await actionBtns.nth(i).click();
      }
    }

    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}