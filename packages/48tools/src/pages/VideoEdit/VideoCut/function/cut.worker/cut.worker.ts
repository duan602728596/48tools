import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

export type WorkerEventData = {
  type: 'start' | 'stop'; // 执行的方法
  playStreamPath: string; // 媒体地址
  filePath: string;       // 文件保存地址
  startTime?: string;     // 开始时间
  endTime?: string;       // 结束时间
  ffmpeg: string;         // ffmpeg地址
};

export type MessageEventData = {
  type: 'close' | 'error';
  error?: Error;
};

type Time = [number, number, number];

/**
 * 计算时间差
 * @param { Time } startTime - 开始时间
 * @param { Time } endTime - 结束时间
 * @return { Time }
 */
export function computingTime(startTime: Time, endTime: Time): Time {
  const startS: number = (startTime[0] * 3600) + (startTime[1] * 60) + startTime[2]; // 开始时间转换到秒
  const endS: number = (endTime[0] * 3600) + (endTime[1] * 60) + endTime[2];         // 结束时间转换到秒
  const cha: number = endS - startS;                                                 // 计算时间差
  const h: number = Number(`${ cha / 3600 }`.match(/\d+/g)![0]);            // 时取整数
  const hp: number = cha % 3600;                                                     // 时取余
  const m: number = Number(`${ hp / 60 }`.match(/\d+/g)![0]);               // 分取整数
  const s: number = hp % 60;                                                         // 分取余 => 秒

  return [h, m, s];
}

let child: ChildProcessWithoutNullStreams;

function toNumber(t: Array<string>): [number, number, number] {
  return [Number(t[0]), Number(t[1]), Number(t[2])];
}

/* 裁剪 */
function cut(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath, startTime, endTime }: WorkerEventData = workerData;
  const ffmpegArgs: Array<string> = [];

  // 裁剪时长
  if (startTime) {
    ffmpegArgs.push('-ss', startTime);

    if (endTime) {
      const startTimeArr: [number, number, number] = startTime ? toNumber(startTime.split(/:/)) : [0, 0, 0];
      const endTimeArr: [number, number, number] = toNumber(endTime.split(/:/));
      const duration: [number, number, number] = computingTime(startTimeArr, endTimeArr);
      const durationStr: string = duration.map((o: number): string => `${ o }`.padStart(2, '0')).join(':');

      ffmpegArgs.push('-t', durationStr);
    }
  }

  // 判断是否为gif或者webp
  if (/\.(gif|webp)$/i.test(filePath)) {
    ffmpegArgs.push('-i', playStreamPath, '-loop', '0', filePath);
  } else {
    ffmpegArgs.push('-accurate_seek', '-i', playStreamPath, '-c', 'copy', '-avoid_negative_ts', '1', filePath);
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