import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';

/**
 * ffmpeg下载线程
 */
export type WorkerEventData = {
  type: 'start' | 'stop';      // 执行的方法
  playStreamPath: string;      // 媒体地址
  filePath: string;            // 文件保存地址
  ffmpeg: string;              // ffmpeg地址
  ua?: boolean;                // 是否添加"-user_agent"参数
  protocolWhitelist?: boolean; // 是否添加"-protocol_whitelist"参数
  libx264?: boolean;           // 转换为libx264
};

const userAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko)'
  + ' Chrome/77.0.3865.90 Safari/537.36';
let child: ChildProcessWithoutNullStreams;

/* 下载 */
function download(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath, ua, protocolWhitelist, libx264 }: WorkerEventData = workerData;
  let ffmpegArgs: Array<string> = ['-i', playStreamPath, '-c', 'copy', filePath];

  if (libx264) {
    ffmpegArgs = ['-i', playStreamPath, '-vcodec', 'libx264', filePath];
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
  });

  child.stderr.on('data', function(data: Buffer): void {
    // console.log(data.toString());
  });

  child.on('close', function(...args: string[]): void {
    postMessage({ type: 'close' });
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