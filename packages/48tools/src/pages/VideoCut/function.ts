type InputNumberValue = string | number | undefined;

/**
 * 判断是否为数字，并返回数字或空
 * @param { InputNumberValue } v: 数字
 */
function isNumber(v: InputNumberValue): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/**
 * 根据时分秒获取完整时间
 * @param { InputNumberValue } h: 时
 * @param { InputNumberValue } m: 分
 * @param { InputNumberValue } s: 秒
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

type Time = [number, number, number];

/**
 * 计算时间差
 * @param { Time } startTime: 开始时间
 * @param { Time } endTime  : 结束时间
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