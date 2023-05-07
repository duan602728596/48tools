import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { _UtilObject } from '../../../../../main/src/logProtocol/logTemplate/ffmpeg';
import { _ffmpegLogProtocol } from '../../logProtocol/logActions';

const _stdout: Array<string> = [];

/**
 * ffmpeg下载线程
 */
export type WorkerEventData = {
  type: 'start' | 'stop';                 // 执行的方法
  playStreamPath: Array<string> | string; // 媒体地址
  filePath: string;                       // 文件保存地址
  ffmpeg: string;                         // ffmpeg地址
  ua?: boolean;                           // 是否添加"-user_agent"参数
  protocolWhitelist?: boolean;            // 是否添加"-protocol_whitelist"参数
  libx264?: boolean;                      // 转换为libx264
  qid?: string;                           // id
  ffmpegHeaders?: string;                 // ffmpeg的headers
  concat?: boolean;                       // 合并
};

export interface ErrorMessageEventData {
  type: 'error';
  error: Error;
}

export interface CloseMessageEventData {
  type: 'close';
  qid?: string;
}

export interface ProgressMessageEventData {
  type: 'progress';
  qid: string;
  data: number;
}

export type MessageEventData = ErrorMessageEventData | CloseMessageEventData | ProgressMessageEventData;

const userAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko)'
  + ' Chrome/77.0.3865.90 Safari/537.36';
let child: ChildProcessWithoutNullStreams;
let duration: number | null = null;

/* 将字符串时间转换成秒 */
function timeToSecond(time: string): number {
  const t: string[] = time.split(/:/g);

  return (Number(t[0]) * 3600) + (Number(t[1]) * 60) + Number(t[2]);
}

/**
 * 解析进度条
 * @param { string } qid: 唯一ID
 * @param { string } str: 进度条数据
 */
function ffmpegProgressParse(qid: string, str: string): void {
  // 输入
  if (/^\s*Input/i.test(str)) {
    const durationStr: RegExpMatchArray | null = str.match(/Duration:\s*\d+:\d+:\d+(\.\d+)?/ig);

    if (durationStr) {
      const durationTime: string = durationStr[0].replace(/^Duration:\s*/i, '');

      duration = timeToSecond(durationTime);
    }

    return;
  }

  // 时间
  if (/time=\d+:\d+:\d+(\.\d+)?/i.test(str) && duration !== null) {
    const timeStr: RegExpMatchArray | null = str.match(/time=\d+:\d+:\d+(\.\d+)?/ig);

    if (timeStr) {
      const timeNow: string = timeStr[0].replace(/^time\s*=\s*/i, '');
      const time: number = timeToSecond(timeNow);

      postMessage({
        type: 'progress',
        data: Math.floor(time / duration * 100),
        qid
      });
    }

    return;
  }
}

/* 处理playStreamPath */
function playStreamPathArray(playStreamPath: Array<string> | string): Array<string> {
  if (typeof playStreamPath === 'string') {
    return ['-i', playStreamPath];
  }

  return playStreamPath.map((p: string, index: number): ['-i', string] => ['-i', p]).flat();
}

/* 下载 */
function download(workerData: WorkerEventData): void {
  const {
    ffmpeg,
    playStreamPath,
    filePath,
    ua,
    protocolWhitelist,
    libx264,
    qid,
    ffmpegHeaders,
    concat
  }: WorkerEventData = workerData;
  let ffmpegArgs: Array<string> = playStreamPathArray(playStreamPath).concat(
    concat ? ['-c:v', 'copy', '-c:a', 'aac', filePath] : ['-c', 'copy', filePath]);

  if (libx264) {
    ffmpegArgs = playStreamPathArray(playStreamPath).concat(['-vcodec', 'libx264', filePath]);
  }

  if (ffmpegHeaders) {
    ffmpegArgs.unshift('-headers', ffmpegHeaders);
  }

  if (ua) {
    ffmpegArgs.unshift('-user_agent', userAgent);
  }

  if (protocolWhitelist) {
    ffmpegArgs.unshift('-protocol_whitelist', 'file,http,https,tcp,tls');
  }

  child = spawn(ffmpeg, ffmpegArgs);

  child.stdout.on('data', function(data: Buffer): void {
    // console.log(data.toString());
    _stdout.push(data.toString());
  });

  child.stderr.on('data', function(data: Buffer): void {
    // console.log(data.toString());
    _stdout.push(data.toString());
    qid && ffmpegProgressParse(qid, data.toString());
  });

  child.on('close', function(...args: string[]): void {
    _ffmpegLogProtocol.post<_UtilObject>('util', {
      ffmpeg,
      input: playStreamPath,
      output: filePath,
      cmd: ffmpegArgs,
      stdout: _stdout.join('\n')
    });
    postMessage({ type: 'close', qid });
  });

  child.on('error', function(err: Error): void {
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
function stop(): void {
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