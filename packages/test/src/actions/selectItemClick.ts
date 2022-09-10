import type { Locator } from 'playwright';
import ElectronApp from '../utils/ElectronApp.js';

/**
 * 点击select的item
 * @param { ElectronApp } app
 * @param { string | Locator } selectId: 点击的select
 * @param { string } title: item的标题
 */
async function selectItemClick(app: ElectronApp, selectId: string | Locator, title: string): Promise<void> {
  let select: Locator;

  if (typeof selectId === 'string') {
    select = await app.win.locator(`[data-test-id="${ selectId }"] .ant-select`);
  } else {
    select = selectId;
  }

  await select.click();

  const selectItem: Locator = await app.win.locator(`.ant-select-item[title="${ title }"]`);

  await selectItem.click();
  await app.win.waitForTimeout(1_000);
}

export default selectItemClick;