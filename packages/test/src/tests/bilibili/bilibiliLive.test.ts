import path from 'node:path';
import { test, expect, type JSHandle } from '@playwright/test';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions.js';
import * as config from '../../utils/config.js';
import { requestBilibiliLiveList } from '../../services/services.js';
import { liveRecordingTypeRoomIdAndStart, stopAndDeleteRoomId } from '../../actions/liveRecordingProcess.js';
import { testTitle } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';
import type { BilibiliLiveListResponse } from '../../services/interface.js';

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

  test(testTitle(TestId.BiliBiliLive.GetLiveVideo, 'Should get bilibili live video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.bilibiliDir, 'bilibili-live.flv');

    await fse.ensureDir(config.bilibiliDir);
    await mockShowSaveDialog(app, downloadVideoPath);

    // 设置ffmpeg的位置
    const [liveList]: [BilibiliLiveListResponse, JSHandle<void>, void] = await Promise.all([
      requestBilibiliLiveList(),
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'bilibili-live-link');
        await testIdClick(app, 'bilibili-add-live-id-btn');
      })()
    ]);

    await liveRecordingTypeRoomIdAndStart(app, liveList.data.room_list[1].list[0].roomid.toString());
    await stopAndDeleteRoomId(app);
    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}