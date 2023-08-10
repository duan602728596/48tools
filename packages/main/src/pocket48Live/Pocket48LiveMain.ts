import { Worker } from 'node:worker_threads';
import * as path from 'node:path';
import type { BrowserWindow } from 'electron';
import { isDevelopment, workerProductionBasePath } from '../utils';
import { Pocket48LiveRemoteHandleChannel } from '../channelEnum';

/* 缓存子线程 */
export const pocket48LiveMap: Map<string, Pocket48LiveMain> = new Map();

export interface Pocket48LiveArgs {
  readonly id: string;
  readonly liveId: string;
  readonly roomId: string;
  readonly playStreamPath: string;
  readonly filePath: string;
  readonly ffmpeg: string;
}

interface CloseMessage {
  type: 'close';
  log: {
    ffmpeg: string;
    input: string;
    output: string;
    cmd: Array<string>;
    stdout: string;
  };
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

/* 主进程中开启子线程下载直播视频 */
export class Pocket48LiveMain {
  id: string;
  liveId: string;
  roomId: string;
  playStreamPath: string;
  filePath: string;
  ffmpeg: string;
  win: BrowserWindow;
  worker: Worker;

  constructor(args: Pocket48LiveArgs, win: BrowserWindow) {
    this.id = args.id;
    this.liveId = args.liveId;
    this.roomId = args.roomId;
    this.playStreamPath = args.playStreamPath;
    this.filePath = args.filePath;
    this.ffmpeg = args.ffmpeg;
    this.win = win;
    this.worker = new Worker(
      isDevelopment
        ? path.join(__dirname, 'liveDownload.worker.js')
        : path.join(workerProductionBasePath, 'pocket48Live/liveDownload.worker.js'),
      {
        workerData: {
          playStreamPath: this.playStreamPath,
          filePath: this.filePath,
          ffmpeg: this.ffmpeg
        }
      }
    );

    this.worker.on('message', this.handleWorkerMessage);
  }

  handleWorkerMessage: (message: CloseMessage | ErrorMessage) => void = (message: CloseMessage | ErrorMessage): void => {
    this.worker.terminate();
    this.win.webContents.send(`${ Pocket48LiveRemoteHandleChannel.Pocket48LiveClose }${ this.id }`, JSON.stringify({
      id: this.id,
      log: message.type === 'close' ? message.log : null
    }));
    pocket48LiveMap.delete(this.id);
  };

  kill(): void {
    this.worker.postMessage({ type: 'kill' });
  }
}