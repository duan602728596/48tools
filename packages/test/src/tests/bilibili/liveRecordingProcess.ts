import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import type { ElementHandle, Locator } from 'playwright';
import type ElectronApp from '../../utils/ElectronApp.js';

/* 输入房间号并开始录制 */
export async function liveRecordingTypeRoomIdAndStart(app: ElectronApp, roomId: string): Promise<void> {
  // 输入直播间号
  await Promise.all([
    app.win.waitForSelector('#description'),
    app.win.waitForSelector('#roomId')
  ]);
  await app.win.type('#description', 'test1');
  await app.win.type('#roomId', roomId);
  await app.win.click('.ant-modal-footer button.ant-btn-primary');
  await app.win.waitForTimeout(2_000);

  // 点击开始录制
  const actionBtns: Locator = await app.win.locator('.ant-table-cell button');

  await actionBtns.nth(0).click();
}

/* 十秒后停止录制并删除添加的roomId */
export async function stopAndDeleteRoomId(app: ElectronApp): Promise<void> {
  await setTimeoutPromise(10_000);

  const actionBtns: Locator = await app.win.locator('.ant-table-cell button');

  await actionBtns.nth(0).click();
  await app.win.locator('.ant-popover button.ant-btn-primary').click();

  // 删除数据库内的所有直播号
  const actionBtnsHandle: Array<ElementHandle> = await app.win.$$('.ant-table-cell button');

  for (let i: number = actionBtnsHandle.length - 1; i >= 0; i--) {
    if (i % 2 !== 0) {
      await actionBtns.nth(i).click();
    }
  }
}