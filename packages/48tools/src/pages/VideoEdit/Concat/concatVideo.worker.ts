import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

type WorkerEventData = {
  type: 'start' | 'stop';
  filePath: string; // 输出的文件地址
  textPath: string; // 输入的文件地址
  ffmpeg: string;   // ffmpeg地址
};

let child: ChildProcessWithoutNullStreams;

/* 下载 */
function download(workerData: WorkerEventData): void {
  const { ffmpeg, filePath, textPath }: WorkerEventData = workerData;
  const ffmpegArgs: Array<string> = ['-f', 'concat', '-safe', '0', '-i', textPath, '-c', 'copy', filePath];

  child = spawn(ffmpeg, ffmpegArgs);

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