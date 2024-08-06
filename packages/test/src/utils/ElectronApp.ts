import path from 'node:path';
import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import electronPath from 'electron/index.js';
import fse from 'fs-extra';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

interface InitOptions {
  dark?: boolean;
}

/* 获取electron相关的对象 */
class ElectronApp {
  electronApp: ElectronApplication;
  win: Page;
  mediaDir?: string;

  // 初始化
  async init(options?: InitOptions): Promise<void> {
    this.mediaDir && await fse.ensureDir(this.mediaDir);
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../main/lib/main.mjs')],
      env: {
        NODE_ENV: 'development',
        TEST: 'true'
      },
      colorScheme: options?.dark ? 'dark' : 'light',
      executablePath: electronPath
    });
    this.win = await this.electronApp.firstWindow();
  }

  // 关闭
  close(): Promise<void> {
    return this.electronApp.close();
  }
}

export default ElectronApp;