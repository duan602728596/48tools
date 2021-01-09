import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { computingTime } from './function';

export type WorkerEventData = {
  type: 'start' | 'stop';      // 执行的方法
  playStreamPath: string;      // 媒体地址
  filePath: string;            // 文件保存地址
  startTime?: string;          // 开始时间
  endTime?: string;            // 结束时间
  ffmpeg: string;              // ffmpeg地址
};

export type MessageEventData = {
  type: 'close' | 'error';
  error?: Error;
};

let child: ChildProcessWithoutNullStreams;

function toNumber(t: Array<string>): [number, number, number] {
  return [Number(t[0]), Number(t[1]), Number(t[2])];
}

/* 裁剪 */
function cut(data: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath, startTime, endTime }: WorkerEventData = data;
  const args: Array<string> = [];

  // 裁剪时长
  if (startTime) {
    args.push('-ss', startTime);

    if (endTime) {
      const startTimeArr: [number, number, number] = startTime ? toNumber(startTime.split(/:/)) : [0, 0, 0];
      const endTimeArr: [number, number, number] = toNumber(endTime.split(/:/));
      const duration: [number, number, number] = computingTime(startTimeArr, endTimeArr);
      const durationStr: string = duration.map((o: number): string => `${ o }`.padStart(2, '0')).join(':');

      args.push('-t', durationStr);
    }
  }

  // 判断是否为gif或者webp
  if (/\.(gif|webp)$/i.test(filePath)) {
    args.push('-i', playStreamPath, '-loop', '0', filePath);
  } else {
    args.push('-accurate_seek', '-i', playStreamPath, '-c', 'copy', '-avoid_negative_ts', '1', filePath);
  }

  child = spawn(ffmpeg, args);

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

/* 停止裁剪 */
function stop(): void {
  child.kill('SIGTERM');
}

addEventListener('message', function(event: MessageEvent<WorkerEventData>): void {
  const { type }: WorkerEventData = event.data;

  switch (type) {
    case 'start':
      cut(event.data);
      break;

    case 'stop':
      stop();
      break;
  }
});