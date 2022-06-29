import path from 'node:path';
import { _electron as electron } from 'playwright';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

/* 获取electron相关的对象 */
class ElectronApp {
  // 初始化
  async init() {
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../../main/lib/main.js')],
      env: {
        NODE_ENV: 'development'
      }
    });
    this.win = await this.electronApp.firstWindow();
  }

  // 关闭
  async close() {
    await this.electronApp.close();
  }
}

export default ElectronApp;