import * as path from 'node:path';
import * as process from 'node:process';
import { Worker } from 'node:worker_threads';
import { ipcMain, type IpcMainEvent } from 'electron';
import { isDevelopment } from '../utils';

export const type: string = 'proxy-server';
let proxyServerWorker: Worker | null = null; // proxy-server服务线程

export interface ProxyServerArg {
  port: number;
}

/* 关闭代理服务 */
export async function proxyServerClose(): Promise<void> {
  if (proxyServerWorker) {
    await proxyServerWorker.terminate();
    proxyServerWorker = null;
  }
}

/* 新线程启动代理服务 */
function proxyServer(): void {
  ipcMain.on(type, async function(event: IpcMainEvent, arg: ProxyServerArg): Promise<void> {
    await proxyServerClose();

    proxyServerWorker = new Worker(
      isDevelopment
        ? path.join(__dirname, 'httpProxyServer.worker.js')
        : path.join(process.resourcesPath, 'app.asar.unpacked/bin/lib/proxyServer/httpProxyServer.worker.js'),
      {
        workerData: arg
      }
    );
  });
}

export default proxyServer;