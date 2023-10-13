import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { parse, type ParsedPath } from 'node:path';
import { setTimeout } from 'node:timers';
import { requestLiveRoomInfo, type LiveRoomInfo } from '@48tools-api/48';
import type { _UtilObject } from '../../../../../../../main/src/logProtocol/logTemplate/ffmpeg.mjs';
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
  roomId: string;         // 直播房间地址
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
let retryIndex: number = 0;

function formatCommend(t: string): string {
  return isMacOS ? `"${ t }"` : t;
}

/* 下载 */
function download(workerData: WorkerEventData, isRetry?: boolean): void {
  const { ffmpeg, playStreamPath, filePath }: WorkerEventData = workerData;
  let filePath2: string = filePath;

  if (isRetry) {
    const parseResult: ParsedPath = parse(filePath);

    filePath2 = `${ parseResult.dir }/${ parseResult.name }(${ retryIndex })${ parseResult.ext }`;
  }

  const ffmpegArgs: Array<string> = [
    '-rw_timeout',
    `${ (1_000 ** 2) * 60 * 5 }`,
    '-i',
    formatCommend(playStreamPath),
    '-c',
    'copy',
    formatCommend(filePath2)
  ];

  child = spawn(formatCommend(ffmpeg), ffmpegArgs, { shell: isMacOS });

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

    if (isKilled) {
      postMessage({ type: 'close' });
    } else {
      retryIndex++;
      // 60秒后重试
      setTimeout((): void => {
        requestLiveRoomInfo(workerData.liveId).then((res: LiveRoomInfo): void => {
          if (res.success && res.content.playStreamPath !== workerData.playStreamPath) {
            download({
              type: 'start',
              playStreamPath: res.content.playStreamPath,
              filePath: workerData.filePath,
              ffmpeg: workerData.ffmpeg,
              liveId: workerData.liveId,
              roomId: workerData.roomId
            }, true);
          } else {
            postMessage({ type: 'close' });
          }
        });
      }, 60_000);
    }
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
function stop(): void {
  isKilled = true;
  child?.kill?.('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  switch (event.data.type) {
    case 'start':
      download(event.data);
      break;

    case 'stop':
      stop();
      break;
  }
});