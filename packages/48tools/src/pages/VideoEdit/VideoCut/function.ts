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