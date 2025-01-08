import type { Locator } from '@playwright/test';
import ElectronApp from '../utils/ElectronApp.js';

/**
 * 点击testId
 * @param { ElectronApp } app
 * @param { string } testId - test id
 */
async function testIdClick(app: ElectronApp, testId: string): Promise<void> {
  const navBtn: Locator = app.win.getByTestId(testId);

  await navBtn.click();
}

export default testIdClick;