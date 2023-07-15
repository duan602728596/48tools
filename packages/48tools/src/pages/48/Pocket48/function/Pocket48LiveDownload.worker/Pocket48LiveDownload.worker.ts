import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { parse, type ParsedPath } from 'node:path';
import liveStatus from '../liveStatus';
import type { _UtilObject } from '@48tools/main/src/logProtocol/logTemplate/ffmpeg';
import { _ffmpegLogProtocol } from '../../../../../utils/logProtocol/logActions';

const _stdout: Array<string> = [];

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

let child: ChildProcessWithoutNullStreams;
let isKilled: boolean = false; // 手动结束
let retryIndex: number = 0;    // 重试次数

/* 下载 */
function download(workerData: WorkerEventData, isRetryDownload?: boolean): void {
  const { ffmpeg, playStreamPath, filePath, liveId }: WorkerEventData = workerData;
  let filePath2: string = filePath;

  if (isRetryDownload) {
    const parseResult: ParsedPath = parse(filePath);

    filePath2 = `${ parseResult.dir }/${ parseResult.name }(${ retryIndex })${ parseResult.ext }`;
    console.log(`口袋48直播录制1：重试第${ retryIndex }次。 ${ filePath2 }`);
  }

  const ffmpegArgs: Array<string> = [
    '-rw_timeout',
    `${ (1_000 ** 2) * 60 * 5 }`,
    '-i',
    playStreamPath,
    '-c',
    'copy',
    filePath2
  ];

  child = spawn(ffmpeg, ffmpegArgs);

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

    if (isKilled) {
      postMessage({ type: 'close' });
    } else {
      liveStatus(liveId).then((r: boolean): void => {
        if (r) {
          retryIndex++;
          download(workerData, true);
        } else {
          postMessage({ type: 'close' });
        }
      });
    }
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
function stop(): void {
  isKilled = true;
  child.kill('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type }: WorkerEventData = event.data;

  switch (type) {
    case 'start':
      download(event.data);
      break;

    case 'stop':
      stop();
      break;
  }
});