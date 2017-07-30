/* 公共函数 */

/**
 * 将对象转换成一个数组
 * @param { Object } obj
 * @return { Array }
 */
export function objectToArray(obj){
  const arr = [];
  for(let key in obj){
    arr.push(obj[key]);
  }
  return arr;
}

/**
 * 格式化时间
 * @param { String } modules         : 格式化的字符串
 * @param { String | Number } timeStr: 时间戳
 * @return { String }
 */
export function time(modules, timeStr){
  const date = timeStr ? new Date(timeStr) : new Date();
  const YY = date.getFullYear(),
    MM = date.getMonth() + 1,
    DD = date.getDate(),
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds();

  return modules.replace(/Y{2}/, YY)
    .replace(/M{2}/, MM)
    .replace(/D{2}/, DD)
    .replace(/h{2}/, hh)
    .replace(/m{2}/, mm)
    .replace(/s{2}/, ss);
}

export default time;