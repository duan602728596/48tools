import path from 'node:path';
import { test, expect } from '@playwright/test';
import type { JSHandle } from 'playwright';
import { JSDOM } from 'jsdom';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions.js';
import * as config from '../../utils/config.js';
import { getAcfunLiveHtml } from '../../services/services.js';
import { liveRecordingTypeRoomIdAndStart, stopAndDeleteRoomId } from '../bilibili/liveRecordingProcess.js';
import Names from '../../utils/Names.js';

const testNames: Names = new Names('acfun-live', ['default']);

/* A站直播测试 */
export const title: string = 'AcFun/Live Page';

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

  test('[32]Should get bilibili live video', async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.acfunDir, 'acfun-live.flv');

    await fse.ensureDir(config.acfunDir);
    await mockShowSaveDialog(app, downloadVideoPath);

    // 设置ffmpeg的位置
    const [liveHtml]: [string, JSHandle<void>, void] = await Promise.all([
      getAcfunLiveHtml(),
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'acfun-live-link');
        await testIdClick(app, 'acfun-add-live-id-btn');
      })()
    ]);
    const { document: jsdomDocument }: (Window & typeof globalThis) = new JSDOM(liveHtml).window;
    const roomId: string = jsdomDocument.querySelectorAll('.live-list .live-list-item')[0]
      .querySelectorAll('a.list-content-top')[0]
      .getAttribute('href')!
      .replace(/\/live\//i, '');

    await liveRecordingTypeRoomIdAndStart(app, roomId);

    // 选择清晰度
    await selectItemClick(app, 'acfun-live-type', '高清');
    await app.win.locator('.ant-modal-footer button.ant-btn-primary').nth(1).click();

    await stopAndDeleteRoomId(app);
    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}