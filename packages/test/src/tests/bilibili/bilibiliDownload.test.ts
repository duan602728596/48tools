import path from 'node:path';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { test, expect } from '@playwright/test';
import type { Locator, ElementHandle } from 'playwright';
import fse from 'fs-extra';
import { isFileExists } from '@sweet-milktea/utils';
import * as config from '../../utils/config.js';
import ElectronApp from '../../utils/ElectronApp.js';
import testIdClick from '../../actions/testIdClick.js';
import selectItemClick from '../../actions/selectItemClick.js';
import { setFFmpegPath, mockShowSaveDialog } from '../../actions/utilActions.js';
import { testTitle, testLog } from '../../utils/testUtils.js';
import { testConfig } from '../../testConfig.js';

/* B站视频下载测试 */
export const title: string = 'Bilibili/Download Page';

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
  async function query(selectItemTitle: string, id: string, page?: string, proxy?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'bilibili-download-add-btn');
    await Promise.all([
      app.win.waitForSelector('#type'),
      app.win.waitForSelector('#id'),
      app.win.waitForSelector('#page'),
      app.win.waitForSelector('#proxy')
    ]);

    // 选择视频类型并输入查询
    await selectItemClick(app, 'bilibili-download-form-type', selectItemTitle);
    await app.win.type('#id', id);
    page && await app.win.type('#page', page);

    // 港澳台
    if (proxy) {
      await app.win.click('#useProxy');
      await app.win.waitForTimeout(1_500);
      await app.win.click('#proxy');
      await app.win.keyboard.type(testConfig.bilibili.proxy);
      await app.win.waitForTimeout(1_000);
    }

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

  // BV查询
  test(testTitle(41, 'Should get bilibili video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'bilibili-download-link');

    // 【4月/主题曲/官方歌词】剃须。然后捡到女高中生 OP&ED【中文字幕】https://www.bilibili.com/video/BV1Hp4y1t7Nd
    await query('视频（BV）', '1Hp4y1t7Nd');

    // 【心灵终结3.3.6】全战役终结难度通关合集 https://www.bilibili.com/video/av370522884
    await query('视频（av）', '724265559', '140');

    // 有点甜（cover汪苏泷、BY2）翻唱：胡丽芝、田姝丽 https://www.bilibili.com/audio/au590187
    await query('音频（au）', '590187');

    // 魔法少女小圆 https://www.bilibili.com/bangumi/play/ep63470
    await query('番剧（ep）', '63470');

    // 吹响吧！上低音号 https://www.bilibili.com/bangumi/play/ss1547
    await query('番剧（ss）', '1547');

    // 等待查询结果
    await app.win.waitForTimeout(2_000);
    await app.win.waitForSelector('.ant-table-row');

    const willBeDownload: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(willBeDownload.length).toEqual(5);
  });

  test(testTitle(42, 'Should get bilibili video with proxy'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    if (!testConfig.bilibili.useProxy) {
      testLog(42, 'Do not run test because proxy closed');
      test.skip();
    }

    await testIdClick(app, 'bilibili-download-link');

    // SHADOWS HOUSE-影宅-（僅限港澳台地區） https://www.bilibili.com/bangumi/play/ep398517
    await query('番剧（ep）', '398517', undefined, true); // 关闭后会保存proxy的选择，所以只执行一次

    // 刮掉鬍子的我與撿到的女高中生（僅限港澳台地區）https://www.bilibili.com/bangumi/play/ep398301
    await query('番剧（ep）', '398301', undefined, false);

    // 繼母的拖油瓶是我的前女友（僅限港澳台地區） https://www.bilibili.com/bangumi/play/ss42121
    await query('番剧（ss）', '42121', undefined, false);

    // 青梅竹馬絕對不會輸的戀愛喜劇（僅限港澳台地區） https://www.bilibili.com/bangumi/play/ss38396
    await query('番剧（ss）', '38396', undefined, false);

    // 等待查询结果
    await app.win.waitForTimeout(2_000);
    await app.win.waitForSelector('.ant-table-row');

    const willBeDownload: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(willBeDownload.length).toEqual(4);
  });

  // 根据ID搜索视频
  async function queryBySpaceId(userId: number, length: number, clear?: boolean): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'bilibili-download-add-by-search-btn');

    if (clear) {
      await app.win.click('#spaceId');

      // 10次键盘删除
      for (let i: number = 0; i < 20; i++) {
        await app.win.keyboard.down('Backspace');
      }
    } else {
      await app.win.waitForSelector('#spaceId');
    }

    await app.win.type('#spaceId', userId.toString());
    await app.win.click('.ant-modal-body .ant-form .ant-btn');
    await app.win.waitForTimeout(1_500); // 等待查询结果
    await app.win.waitForFunction((): boolean => document.querySelectorAll('.ant-spin').length === 0);
    await app.win.waitForTimeout(1_000);

    // 点击搜索视频详细数据
    const seeVideo: Locator = app.win.locator('.ant-modal-body .ant-table-cell .ant-btn');

    await seeVideo.nth(0).click();
    await app.win.waitForTimeout(1_500); // 等待查询结果
    await app.win.waitForFunction((): boolean => document.querySelectorAll('.ant-spin').length === 0);
    await app.win.waitForTimeout(1_000);

    // 添加到下载列表
    const addToDownload: Locator = app.win.locator('.ant-modal-body .ant-form + div .overflow-auto .ant-btn');

    await addToDownload.nth(0).click();
    await app.win.waitForFunction(
      (l: number): boolean =>
        document.querySelector('.ant-table-wrapper')!.querySelectorAll('.ant-table-row').length === l,
      length);

    await app.win.click('.ant-modal-footer button.ant-btn');
    await app.win.waitForTimeout(2_000);
  }

  // 根据ID搜索
  test(testTitle(43, 'Should get bilibili video by id'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'bilibili-download-link');

    // 犬山玉姬Official https://space.bilibili.com/12362451/
    await queryBySpaceId(12362451, 1);

    // 時雨羽衣Official https://space.bilibili.com/2601367/
    await queryBySpaceId(2601367, 2, true);

    // 音乐世界CytusII https://space.bilibili.com/270735958/
    await queryBySpaceId(270735958, 3, true);

    // 结果
    await app.win.waitForSelector('.ant-table-row');

    const willBeDownload: Array<ElementHandle> = await app.win.$$('.ant-table-row');

    expect(willBeDownload.length).toEqual(3);
  });

  // 视频的下载
  test(testTitle(45, 'Should download bilibili video'), async function(): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    const downloadVideoPath: string = path.join(config.bilibiliDir, '1CS4y1W7ef.flv');

    await fse.ensureDir(config.bilibiliDir);
    await mockShowSaveDialog(app, downloadVideoPath);

    await Promise.all([
      setFFmpegPath(app),
      (async (): Promise<void> => {
        await testIdClick(app, 'bilibili-download-link');
        await query('视频（BV）', '1CS4y1W7ef'); // https://www.bilibili.com/video/BV1CS4y1W7ef/
      })()
    ]);

    // 下载
    const actionBtns: Locator = await app.win.locator('.ant-table-cell button');

    await actionBtns.nth(0).click();
    await setTimeoutPromise(5_000);
    await app.win.waitForFunction((): boolean => {
      const button: HTMLButtonElement | null = document.querySelector('.ant-table-cell button');

      if (!button) return false;

      return !button.disabled;
    });
    expect(await isFileExists(downloadVideoPath)).toEqual(true);
  });
}