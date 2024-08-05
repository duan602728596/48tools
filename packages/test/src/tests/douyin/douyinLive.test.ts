import * as path from 'node:path';
import { test, expect, type JSHandle } from '@playwright/test';
import fse from 'fs-extra';
import { JSDOM } from 'jsdom';
import { isFileExists } from '@sweet-milktea/utils';
import ElectronApp from '../../utils/ElectronApp.js';
import { testTitle } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';
import * as config from '../../utils/config.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions.js';
import testIdClick from '../../actions/testIdClick.js';
import { liveRecordingTypeRoomIdAndStart, stopAndDeleteRoomId } from '../../actions/liveRecordingProcess.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { requestDouyinLiveHtml } from '../../services/services.js';

/* 抖音直播测试 */
export const title: string = 'Douyin/Live Page';

/* 获取抖音直播地址 */
async function getLiveList(): Promise<string | undefined> {
  const res: string = await requestDouyinLiveHtml();
  const { window: parseWindow }: JSDOM = new JSDOM(res);
  const parseDocument: Document = parseWindow.document;
  const e2eScrollList: HTMLUListElement | null = parseDocument.querySelector('[data-e2e="scroll-list"]');

  if (!e2eScrollList) return;

  const liElement: HTMLLIElement | null = e2eScrollList.querySelector('li');

  if (!liElement) return;

  const anchorElement: HTMLAnchorElement | null = liElement.querySelector('a');

  if (!anchorElement) return;

  const href: string | null = anchorElement.getAttribute('href');

  if (!href) return;

  return href.match(/[0-9]+/)?.[0];
}

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

  test(testTitle(TestId.DouyinLive.GetLiveVideo, 'Should get douyin live video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const douyinLiveVideoPath: string = path.join(config.douyinDir, 'douyin-live.ts');

    await fse.ensureDir(config.douyinDir);
    await mockShowSaveDialog(app, douyinLiveVideoPath);

    // 设置ffmpeg的位置
    const [liveId]: [string | undefined, JSHandle<void>, void] = await Promise.all([
      getLiveList(),
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'douyin-live-link');
        await testIdClick(app, 'douyin-add-live-id-btn');
      })()
    ]);

    if (!liveId) {
      throw new Error('can not get douyin live id');
    }

    await liveRecordingTypeRoomIdAndStart(app, liveId);
    await selectItemClick(app, await app.win.locator('.ant-modal-body .ant-select'), 'M3U8 - SD1');
    await stopAndDeleteRoomId(app);
    expect(await isFileExists(douyinLiveVideoPath)).toEqual(true);
  });
}