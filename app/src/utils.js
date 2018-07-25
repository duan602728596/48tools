/* 公共函数 */

/**
 * 自动补0
 * @param { number } num
 * @return { string }
 */
export function patchZero(num: number): string{
  if(num < 10){
    return `0${ num }`;
  }else{
    return `${ num }`;
  }
}

/**
 * 格式化时间
 * @param { string } modules : 格式化的字符串
 * @param { ?number } timeStr: 时间字符串
 * @return { string }
 */
export function time(modules: string, timeStr: ?number): string{
  const date: Object = timeStr ? new Date(timeStr) : new Date();
  const YY: number = date.getFullYear(),
    MM: number = date.getMonth() + 1,
    DD: number = date.getDate(),
    hh: number = date.getHours(),
    mm: number = date.getMinutes(),
    ss: number = date.getSeconds();

  return modules.replace(/Y{2}/, YY)
    .replace(/M{2}/, patchZero(MM))
    .replace(/D{2}/, patchZero(DD))
    .replace(/h{2}/, patchZero(hh))
    .replace(/m{2}/, patchZero(mm))
    .replace(/s{2}/, patchZero(ss));
}