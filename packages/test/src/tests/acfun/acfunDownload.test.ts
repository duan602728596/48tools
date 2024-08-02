import path from 'node:path';
import { setTimeout as setTimeoutPromise } from 'timers/promises';
import { test, expect, type ElementHandle } from '@playwright/test';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import * as config from '../../utils/config.js';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { mockShowSaveDialog, setFFmpegPath } from '../../actions/utilActions.js';
import { testTitle } from '../../utils/testUtils.js';
import * as TestId from '../../TestId.js';

/* acfun视频下载 */
export const title: string = 'AcFun/Download Page';

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

  // 执行一次查询
  async function query(selectItemTitle: string, id: string): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'acfun-download-add-btn');
    await Promise.all([
      app.win.waitForSelector('#type'),
      app.win.waitForSelector('#id')
    ]);

    // 选择视频类型并输入查询
    await selectItemClick(app, 'acfun-download-form-type', selectItemTitle);
    await app.win.type('#id', id);
    await app.win.click('.ant-modal-footer button.ant-btn-primary');
    await app.win.waitForFunction((): boolean => {
      const wrap: HTMLElement | null = document.querySelector('.ant-modal-wrap');

      if (!wrap) {
        return true;
      }

      return wrap.style.display === 'none';
    });
    await app.win.waitForTimeout(2_000);
  }

  test(testTitle(TestId.AcFunDownload.GetVideo, 'Should get acfun video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'acfun-download-link');

    // 一日女友，但是眼镜娘 https://www.acfun.cn/v/ac35646798
    await query('视频（ac）', '35646798');

    // 更衣人偶坠入爱河ED 竖屏纯享 https://www.acfun.cn/v/ac35548568
    await query('视频（ac）', '35548568');

    // 【卿斗×楚鸢×鹿久】快！进来看有点甜 就会变特别甜欧！ https://www.acfun.cn/v/ac35499674
    await query('视频（ac）', '35499674');

    // 租借女友 https://www.acfun.cn/bangumi/aa6002917_36188_1740687
    await query('番剧（aa）', '6002917_36188_1740687');

    // 佐贺偶像是传奇 https://www.acfun.cn/bangumi/aa5022161
    await query('番剧（aa）', '5022161');

    // 干物妹！小埋 https://www.acfun.cn/bangumi/aa5025415_36188_333697
    await query('番剧（aa）', '5025415_36188_333697');

    // 等待查询结果
    await app.win.waitForTimeout(2_000);
    await app.win.waitForSelector('.ant-table-row');

    const willBeDownload: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(willBeDownload.length).toEqual(6);
  });

  test(testTitle(TestId.AcFunDownload.DownloadVideo, 'Should download acfun video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.acfunDir, '36727175.mp4');

    await fse.ensureDir(config.acfunDir);
    await mockShowSaveDialog(app, downloadVideoPath);

    await Promise.all([
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'acfun-download-link');
        await query('视频（ac）', '36727175');
      })()
    ]);

    // 下载
    await selectItemClick(app, await app.win.locator('.ant-table-cell .ant-select'), '360P');
    await setTimeoutPromise(5_000);
    await app.win.waitForFunction((): boolean => {
      const button: HTMLButtonElement | null = document.querySelector('.ant-table-cell button');

      if (!button) return false;

      return !button.disabled;
    });
    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}