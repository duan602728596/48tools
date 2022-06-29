import path from 'node:path';
import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

/* 获取electron相关的对象 */
class ElectronApp {
  electronApp: ElectronApplication;
  win: Page;

  async init(): Promise<void> {
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../main/lib/main.js')],
      env: {
        NODE_ENV: 'development'
      }
    });
    this.win = await this.electronApp.firstWindow();
  }

  async close(): Promise<void> {
    await this.electronApp.close();
  }
}

export default ElectronApp;