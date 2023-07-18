import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { workerData, parentPort } from 'node:worker_threads';
import type { Pocket48LiveArgs } from './Pocket48LiveMain';

/**
 * 在软件主进场开启子线程下载视频
 */

const _stdout: Array<string> = [];
const { playStreamPath, filePath, ffmpeg }: Pick<Pocket48LiveArgs, 'playStreamPath' | 'filePath' | 'ffmpeg'> = workerData;
const ffmpegArgs: Array<string> = [
  '-rw_timeout',
  `${ (1_000 ** 2) * 60 * 5 }`,
  '-i',
  playStreamPath,
  '-c',
  'copy',
  filePath
];
const child: ChildProcessWithoutNullStreams = spawn(ffmpeg, ffmpegArgs);

child.stdout.on('data', function(data: Buffer): void {
  // console.log(data.toString());
  _stdout.push(data.toString());
});

child.stderr.on('data', function(data: Buffer): void {
  // console.log(data.toString());
  _stdout.push(data.toString());
});

child.on('close', function(): void {
  parentPort?.postMessage?.({
    type: 'close',
    log: {
      ffmpeg,
      input: playStreamPath,
      output: filePath,
      cmd: ffmpegArgs,
      stdout: _stdout.join('\n')
    }
  });
});

child.on('error', function(err: Error): void {
  parentPort?.postMessage?.({ type: 'error', error: err.toString() });
});

/* 接收关闭信息，结束下载 */
parentPort?.once?.('message', function(value: { type: 'kill' }): void {
  if (value.type === 'kill') {
    child.kill('SIGTERM');
  }
});