import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

type EventData = {
  type: 'start' | 'stop';
  playStreamPath: string;
  filePath: string;
  liveId: string;
  ffmpeg: string;
};

let child: ChildProcessWithoutNullStreams;

/**
 * 下载
 * @param { string } ffmpeg: ffmpeg地址
 * @param { string } playStreamPath: m3u8下载地址
 * @param { string } filePath: 保存的文件地址
 */
function download(ffmpeg: string, playStreamPath: string, filePath: string): void {
  child = spawn(ffmpeg, [
    '-protocol_whitelist',
    'file,http,https,tcp,tls',
    '-i',
    playStreamPath,
    '-c',
    'copy',
    filePath
  ]);

  child.stdout.on('data', function(data: Buffer): void {
    // console.log(data.toString());
  });

  child.stderr.on('data', function(data: Buffer): void {
    // console.log(data.toString());
  });

  child.on('close', function(...args: string[]): void {
    // @ts-ignore
    postMessage({ type: 'close' });
  });

  child.on('error', function(err: Error): void {
    // @ts-ignore
    postMessage({ type: 'error', error: err });
  });
}

/* 停止下载 */
function stop(): void {
  child.kill('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<EventData>): void {
  const { type, ffmpeg, playStreamPath, filePath, liveId }: EventData = event.data;

  switch (type) {
    case 'start':
      download(ffmpeg, playStreamPath, filePath);
      break;

    case 'stop':
      stop();
  }
}, false);