import type { Locator } from 'playwright';
import ElectronApp from '../utils/ElectronApp.js';

/**
 * 点击select的item
 * @param { ElectronApp } app
 * @param { string } selectId: 点击的select
 * @param { string } title: item的标题
 */
async function selectItemClick(app: ElectronApp, selectId: string, title: string): Promise<void> {
  const select: Locator = await app.win.locator(`[data-test-id="${ selectId }"] .ant-select`);

  await select.click();

  const selectItem: Locator = await app.win.locator(`.ant-select-item[title="${ title }"]`);

  await selectItem.click();
  await app.win.waitForTimeout(1_500);
}

export default selectItemClick;