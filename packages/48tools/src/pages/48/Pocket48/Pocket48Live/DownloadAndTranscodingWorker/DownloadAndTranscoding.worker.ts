import * as FluentFFmpeg from 'fluent-ffmpeg';
import type { FfmpegCommand } from 'fluent-ffmpeg';

export type WorkerEventData = {
  type: 'start' | 'stop'; // 执行的方法
  playStreamPath: string; // 媒体地址
  filePath: string;       // 文件保存地址
  ffmpeg: string;         // ffmpeg地址
};

let command: FfmpegCommand;

/**
 * 转码并下载
 * https://stackoverflow.com/questions/16658873/how-to-minimize-the-delay-in-a-live-streaming-with-ffmpeg
 */
function download(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath }: WorkerEventData = workerData;

  if (ffmpeg && ffmpeg !== '') {
    FluentFFmpeg.setFfmpegPath(ffmpeg);
  }

  command = FluentFFmpeg(playStreamPath)
    .inputOptions(['-re'])
    .videoCodec('copy')
    .audioCodec('copy')
    .fps(30)
    .output(filePath)
    .on('end', function(): void {
      postMessage({ type: 'close' });
    })
    .on('error', function(err: Error, stdout: string, stderr: string): void {
      postMessage({ type: 'error', error: err });
    });

  command.run();
}

/* 停止下载 */
function stop(): void {
  command.kill('SIGTERM');
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