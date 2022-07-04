import { test, expect } from '@playwright/test';
import type { ElementHandle } from 'playwright';
import ElectronApp from '../utils/ElectronApp.js';
import testIdClick from '../actions/testIdClick.js';
import selectItemClick from '../actions/selectItemClick.js';

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
  async function query(selectItemTitle: string, id: string, page?: string): Promise<void> {
    if (!app) {
      throw new Error('app is null');
    }

    await testIdClick(app, 'bilibili-download-add-btn');
    await Promise.all([
      app.win.waitForSelector('#type'),
      app.win.waitForSelector('#id'),
      app.win.waitForSelector('#page')
    ]);

    // 选择视频类型并输入查询
    await selectItemClick(app, 'bilibili-download-form-type', selectItemTitle);
    await app.win.type('#id', id);
    page && await app.win.type('#page', page);

    await app.win.click('.ant-modal-footer button.ant-btn-primary');
    await app.win.waitForTimeout(2_000);
  }

  // BV查询
  test('Should get bilibili video query by BV type', async function(): Promise<void> {
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
}