import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { getFFmpeg } from '../../../../utils/utils';

type InputNumberValue = string | number | undefined;

/**
 * 判断是否为数字，并返回数字或空
 * @param { InputNumberValue } v - 数字
 */
function isNumber(v: InputNumberValue): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/**
 * 根据时分秒获取完整时间
 * @param { InputNumberValue } h - 时
 * @param { InputNumberValue } m - 分
 * @param { InputNumberValue } s - 秒
 */
export function getFullTime(h: InputNumberValue, m: InputNumberValue, s: InputNumberValue): string | undefined {
  const hour: number | undefined = isNumber(h),
    minute: number | undefined = isNumber(m),
    second: number | undefined = isNumber(s);

  if (hour === undefined && minute === undefined && second === undefined) {
    return undefined;
  }

  const hourStr: string = `${ hour ?? 0 }`.padStart(2, '0'),
    minuteStr: string = `${ minute ?? 0 }`.padStart(2, '0'),
    secondStr: string = `${ second ?? 0 }`.padStart(2, '0');

  return `${ hourStr }:${ minuteStr }:${ secondStr }`;
}

/* 从ffmpeg中获得可以使用gpu加速的办法 */
export function getHwaccels(): Promise<Array<string>> {
  const ffmpeg: string = getFFmpeg();
  const hwaccelsArr: Array<string> = [];

  return new Promise((resolve: Function, reject: Function): void => {
    const child: ChildProcessWithoutNullStreams = spawn(ffmpeg, ['-hwaccels']);

    child.stdout.on('data', function(data: Buffer): void {
      const result: Array<string> = data.toString().split(':');
      const actions: Array<string> = result[1].split(/\r?\n/);

      hwaccelsArr.push(...actions.filter((o: string): boolean => o !== ''));
    });

    child.stderr.on('data', function(data: Buffer): void {
      // console.log(data.toString());
    });

    child.on('close', function(...args: string[]): void {
      resolve(hwaccelsArr);
    });

    child.on('error', function(err: Error): void {
      console.error(err);
      resolve(hwaccelsArr);
    });
  });
}