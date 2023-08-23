import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { setInterval, clearInterval } from 'node:timers';
import { parseArgsStringToArgv } from 'string-argv';
import type { ProcessItem } from '../../../types';

export type WorkerEventData = {
  type: 'start' | 'stop'; // 执行的方法
  ffmpeg: string;         // ffmpeg地址
  item: Pick<ProcessItem, 'id' | 'args'>;
};

export interface ErrorMessageEventData {
  type: 'error';
  id: string;
  error: Error;
}

export interface CloseMessageEventData {
  type: 'close';
  id: string;
}

export interface ProgressMessageEventData {
  type: 'message';
  id: string;
  data: string;
}

export type MessageEventData = ErrorMessageEventData | CloseMessageEventData | ProgressMessageEventData;

let child: ChildProcessWithoutNullStreams;
let processItem: Pick<ProcessItem, 'id' | 'args'>;
let killTimer: NodeJS.Timeout | null;

/* 执行命令 */
function runProcess(data: WorkerEventData): void {
  child = spawn(data.ffmpeg, parseArgsStringToArgv(data.item.args));

  child.stdout.on('data', function(d: Buffer): void {
    postMessage({ type: 'message', id: data.item.id, data: d.toString() });
  });

  child.stderr.on('data', function(d: Buffer): void {
    postMessage({ type: 'message', id: data.item.id, data: d.toString() });
  });

  child.on('close', function(...args: string[]): void {
    postMessage({ type: 'close', id: data.item.id });
    clearInterval(killTimer!);
    killTimer = null;
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', id: data.item.id, error: err });
    clearInterval(killTimer!);
    killTimer = null;
  });
}

/* 停止下载 */
function stop(data: WorkerEventData): void {
  child.kill('SIGTERM');
  // 用来解决等待输入时kill会不触发事件的问题
  killTimer = setInterval((): void => {
    if (child.killed) {
      postMessage({ type: 'close', id: data.item.id });
      clearInterval(killTimer!);
      killTimer = null;
    }
  }, 1_000);
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type, item }: WorkerEventData = event.data;

  processItem = item;

  switch (type) {
    case 'start':
      runProcess(event.data);
      break;
    case 'stop':
      stop(event.data);
      break;
  }
});