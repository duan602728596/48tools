/* 公共函数 */
const gui = global.require('nw.gui');

/**
 * 自动补0
 * @param { number } num
 * @return { string }
 */
export function patchZero(num) {
  if (num < 10) {
    return `0${ num }`;
  } else {
    return `${ num }`;
  }
}

/**
 * 格式化时间
 * @param { string } modules : 格式化的字符串
 * @param { ?number } timeStr: 时间字符串
 * @return { string }
 */
export function time(modules, timeStr) {
  const date = timeStr ? new Date(timeStr) : new Date();
  const YY = date.getFullYear(),
    MM = date.getMonth() + 1,
    DD = date.getDate(),
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds();

  return modules.replace(/Y{2}/, YY)
    .replace(/M{2}/, patchZero(MM))
    .replace(/D{2}/, patchZero(DD))
    .replace(/h{2}/, patchZero(hh))
    .replace(/m{2}/, patchZero(mm))
    .replace(/s{2}/, patchZero(ss));
}

/* 在浏览器上打开页面 */
export function handleOpenBrowser(href, event) {
  event.preventDefault();
  gui.Shell.openExternal(href);
}