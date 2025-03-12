import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

export type WorkerEventData = {
  type: 'start' | 'stop'; // 执行的方法
  playStreamPath: string; // 媒体地址
  filePath: string;       // 文件保存地址
  startTime?: `${ number }:${ number }:${ number }`; // 开始时间
  endTime?: `${ number }:${ number }:${ number }`; // 结束时间
  reEncoding?: boolean;   // 精确剪辑，重新编码
  hwaccel?: string;       // GPU加速
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
  const startSecond: number = (startTime[0] * 3_600) + (startTime[1] * 60) + startTime[2]; // 开始时间转换到秒
  const endSecond: number = (endTime[0] * 3_600) + (endTime[1] * 60) + endTime[2];         // 结束时间转换到秒
  const diffSecond: number = endSecond - startSecond;                                      // 计算时间差
  const hourInteger: number = Math.floor(diffSecond / 3_600);                              // 时取整数
  const hourRemainder: number = diffSecond % 3_600;                                        // 时取余数
  const minuteInteger: number = Math.floor(hourRemainder / 60);                            // 分取整数
  const minuteRemainder: number = hourRemainder % 60;                                      // 分取余 => 秒

  return [hourInteger, minuteInteger, minuteRemainder];
}

let child: ChildProcessWithoutNullStreams;

function toNumber(t: Array<string>): [number, number, number] {
  return [Number(t[0]), Number(t[1]), Number(t[2])];
}

/* 裁剪 */
function cut(workerData: WorkerEventData): void {
  const { ffmpeg, playStreamPath, filePath, startTime, endTime }: WorkerEventData = workerData;
  const ffmpegArgs: Array<string> = [];

  if (workerData.hwaccel && workerData.hwaccel !== '无') {
    ffmpegArgs.push('-hwaccel', workerData.hwaccel);
  }

  // 裁剪时长
  if (startTime || endTime) {
    if (startTime) ffmpegArgs.push('-accurate_seek', '-ss', startTime);

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
    ffmpegArgs.push('-i', playStreamPath);

    if (workerData.reEncoding) {
      ffmpegArgs.push('-c:v', 'libx264', '-c:a', 'aac');
    } else {
      ffmpegArgs.push('-c', 'copy');
    }

    ffmpegArgs.push('-avoid_negative_ts', '1', filePath);
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