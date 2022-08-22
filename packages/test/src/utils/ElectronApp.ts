import * as path from 'node:path';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { _electron as electron, type ElectronApplication, type BrowserContext, type Page } from 'playwright';
import electronPath from 'electron/index.js';
import fse from 'fs-extra';
import { metaHelper } from '@sweet-milktea/utils';
import { mediaDir } from './config.js';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);

interface Options {
  mediaName?: string;
}

/* 获取electron相关的对象 */
class ElectronApp {
  electronApp: ElectronApplication;
  win: Page;
  mediaDir?: string;
  timer?: number;
  index: number = 0;

  constructor(options: Options = {}) {
    this.mediaDir = options.mediaName ? path.join(mediaDir, options.mediaName) : undefined;
  }

  // 截图，截图后通过ffmpeg -r 4 -i %d.png 1.mp4可以合成视频
  screenshot: Function = async (): Promise<void> => {
    try {
      await this.win.screenshot({
        path: path.join(this.mediaDir!, `${ this.index++ }.png`),
        fullPage: true
      });
    } finally {
      this.timer = setTimeout(this.screenshot, 250);
    }
  };

  // 初始化
  async init(): Promise<void> {
    this.mediaDir && await fse.ensureDir(this.mediaDir);
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../main/lib/main.js')],
      env: {
        NODE_ENV: 'development',
        TEST: 'true'
      },
      colorScheme: 'light',
      executablePath: electronPath
    });
    this.win = await this.electronApp.firstWindow();
    this.mediaDir && (this.timer = setTimeout(this.screenshot, 250));
  }

  // 关闭
  async close(): Promise<void> {
    if (typeof this.timer !== 'undefined') {
      clearTimeout(this.timer);
      await setTimeoutPromise(3_500);
    }

    await this.electronApp.close();
  }
}

export default ElectronApp;