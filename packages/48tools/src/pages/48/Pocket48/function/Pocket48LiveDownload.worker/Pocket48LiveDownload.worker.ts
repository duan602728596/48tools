import { spawn, exec, type ChildProcessWithoutNullStreams, type ChildProcess } from 'node:child_process';
import type { _UtilObject } from '@48tools/main/src/logProtocol/logTemplate/ffmpeg';
import { _ffmpegLogProtocol } from '../../../../../utils/logProtocol/logActions';
import { isMacOS } from '../utils';

let _stdout: Array<string> = [];

/**
 * ffmpeg下载线程
 */
export type WorkerEventData = {
  type: 'start' | 'stop'; // 执行的方法
  playStreamPath: string; // 媒体地址
  filePath: string;       // 文件保存地址
  ffmpeg: string;         // ffmpeg地址
  liveId: string;         // 播放ID
};

export interface ErrorMessageEventData {
  type: 'error';
  error: Error;
}

export interface CloseMessageEventData {
  type: 'close';
}

export type MessageEventData = ErrorMessageEventData | CloseMessageEventData;

let child: ChildProcessWithoutNullStreams, childMacOS: ChildProcess;
let isKilled: boolean = false; // 手动结束

/* 下载 */
function download(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath }: WorkerEventData = workerData;
  const ffmpegArgs: Array<string> = [
    '-rw_timeout',
    `${ (1_000 ** 2) * 60 * 5 }`,
    '-i',
    playStreamPath,
    '-c',
    'copy',
    filePath
  ];

  child = spawn(ffmpeg, ffmpegArgs, {
    // @ts-ignore
    maxBuffer: (1024 ** 2) * 100
  });

  child.stdout.on('data', function(data: Buffer): void {
    // console.log(data.toString());
    _stdout.push(data.toString());
  });

  child.stderr.on('data', function(data: Buffer): void {
    // console.log(data.toString());
    _stdout.push(data.toString());
  });

  child.on('close', function(...args: string[]): void {
    _ffmpegLogProtocol.post<_UtilObject>('util', {
      ffmpeg,
      input: playStreamPath,
      output: filePath,
      cmd: ffmpegArgs,
      stdout: _stdout.join('\n')
    });
    _stdout = [];
    postMessage({ type: 'close' });
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', error: err });
  });
}

function execDownload(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath }: WorkerEventData = workerData;
  const ffmpegArgs: Array<string> = [
    ffmpeg,
    '-rw_timeout',
    `${ (1_000 ** 2) * 60 * 5 }`,
    '-i',
    `"${ playStreamPath }"`,
    '-c',
    'copy',
    `"${ filePath }"`
  ];

  childMacOS = exec(ffmpegArgs.join(' '), {
    maxBuffer: (1024 ** 2) * 100
  }, function(err: Error | null, stdout: string, stderr: string): void {
    if (err && !err.toString().includes('Exiting normally')) {
      console.error(err);
      postMessage({ type: 'error', error: err });
    } else {
      _stdout.push(stdout, stderr);
      _ffmpegLogProtocol.post<_UtilObject>('util', {
        ffmpeg,
        input: playStreamPath,
        output: filePath,
        cmd: ffmpegArgs,
        stdout: _stdout.join('\n')
      });
      _stdout = [];
      postMessage({ type: 'close' });
    }
  });
}

/* 停止下载 */
function stop(): void {
  isKilled = true;
  child?.kill?.('SIGTERM');
  childMacOS?.kill?.('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type }: WorkerEventData = event.data;

  switch (type) {
    case 'start':
      isMacOS ? execDownload(event.data) : download(event.data);
      break;

    case 'stop':
      stop();
      break;
  }
});