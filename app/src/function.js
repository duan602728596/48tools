/* 公共函数 */
const path: Object = global.require('path');
const process: Object = global.require('process');
const os: Object = global.require('os');

/**
 * 将对象转换成一个数组
 * @param { Object } obj
 * @return { Array }
 */
export function objectToArray(obj: Object): Function[]{
  const arr: Array = [];
  for(const key: string in obj){
    arr.push(obj[key]);
  }
  return arr;
}

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
 * @param { string } modules       : 格式化的字符串
 * @param { number | null } timeStr: 时间戳
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

/**
 * 获取运行地址
 */
export const type: string = os.type();
export const execPath: string = do{
  let ep: string = '';
  switch(type){
    // mac
    case 'Darwin':
      const p: string[] = process.execPath.match(/^[^\.]+\.app/)[0].split(/\//);
      ep = path.join(p.join('/'), 'Contents');
      break;
    // win32
    default:
      ep = path.dirname(process.execPath).replace(/\\/g, '/');
      break;
  }
  ep;
};