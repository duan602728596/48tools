// @flow
/* 公共函数 */

/**
 * 将对象转换成一个数组
 * @param { Object } obj
 * @return { Array }
 */
export function objectToArray(obj: Object): Function[]{
  const arr: Array = [];
  for(let key in obj){
    arr.push(obj[key]);
  }
  return arr;
}

/**
 * 自动补0
 * @param { Number } num
 * @return { String }
 */
export function patchZero(num: number): string{
  if(num < 10){
    return `0${ num }`;
  }else{
  return `${ num }`
}
}

/**
 * 格式化时间
 * @param { String } modules       : 格式化的字符串
 * @param { Number | null } timeStr: 时间戳
 * @return { String }
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