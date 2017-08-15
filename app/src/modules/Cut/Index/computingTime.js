// @flow
/**
 * 计算时间差
 * @param { Array } startTime: 开始时间
 * @param { Array } endTime  : 结束时间
 * @return { Array }
 */
function computingTime(startTime: number[], endTime: number[]): number[]{
  const startS: number = startTime[0] * 3600 + startTime[1] * 60 + startTime[2];
  const endS: number = endTime[0] * 3600 + endTime[1] * 60 + endTime[2];
  const cha: number = endS - startS;
  const h: number = Number(`${ cha / 3600 }`.match(/\d+/g)[0]);
  const hp: number = cha % 3600;
  const m: number = Number(`${ hp / 60 }`.match(/\d+/g)[0]);
  const s: number = hp % 60;
  return [h, m, s];
}

export default computingTime;