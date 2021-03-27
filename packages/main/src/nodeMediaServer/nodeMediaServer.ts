import * as path from 'path';
import * as process from 'process';
import { Worker } from 'worker_threads';
import { ipcMain, IpcMainEvent } from 'electron';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';
let nodeMediaServerWorker: Worker | null = null;

export interface NodeMediaServerArg {
  ffmpeg: string;   // ffmpeg路径
  rtmpPort: number; // rtmp端口号
  httpPort: number; // http端口号
}

/* 初始化node-media-server服务 */
export function nodeMediaServerInit(): void {
  ipcMain.on('node-media-server', function(event: IpcMainEvent, arg: NodeMediaServerArg): void {
    if (!nodeMediaServerWorker) {
      nodeMediaServerWorker = new Worker(path.join(__dirname, 'server.worker.js'), {
        workerData: {
          ...arg,
          isDevelopment
        }
      });

      nodeMediaServerWorker.on('exit', function(): void {
        nodeMediaServerWorker = null;
      });
    }
  });
}

/* 关闭node-media-server服务 */
export async function nodeMediaServerClose(): Promise<void> {
  if (nodeMediaServerWorker) {
    await nodeMediaServerWorker.terminate();
  }
}