import type { DanmuItem } from '../types';

const regexp: RegExp = /\[[^\[\]]+\]/;
const timeRegex: RegExp = /(\d+):(\d+):(\d+)\.(\d+)/;

/**
 * 格式化弹幕时间
 * [00:05:43.453]转换成秒
 * @param { string } time - 弹幕时间
 * @return { number } 返回的是秒
 */
function formatCurrentTime(time: string): number {
  const match: RegExpMatchArray = timeRegex.exec(time)!;

  return (Number(match[1]) * 3_600)
    + (Number(match[2]) * 60)
    + Number(match[3])
    + (Number(match[4]) / 1_000);
}

/**
 * 定义一个函数，将毫秒数转换为字符串形式的时间
 * @param { number } timeMS - 毫秒数
 */
function formatTime(timeMS: number): string {
  // 计算小时，分钟，秒和毫秒
  const h: string = String(Math.floor(timeMS / 3_600_000)).padStart(2, '0'),
    m: string = String(Math.floor((timeMS % 3_600_000) / 60_000)).padStart(2, '0'),
    s: string = String(Math.floor((timeMS % 60_000) / 1_000)).padStart(2, '0'),
    ms: string = String(timeMS % 1000).padStart(3, '0');

  // 将数字转换为字符串，并补零
  return `${ h }:${ m }:${ s }.${ ms }`;
}

/**
 * 解析弹幕
 * 弹幕格式为 [00:05:43.453]昵称\t弹幕内容
 * @param { string } str - 弹幕原始文本
 */
function formatDanmu(str: string): Array<DanmuItem> {
  const result: Array<DanmuItem> = [];
  const danmuSplit: string[] = str.split('\n')
    .filter((o: string): boolean => !/^\s*$/.test(o));
  let index: number = 0;

  for (const item of danmuSplit) {
    const time: string | undefined = item.match(regexp)?.[0]
      ?.replace?.('[', '')
      .replace(']', '');

    if (time) {
      const noTime: string = item.replace(regexp, '');
      const message: string[] = noTime.split(/\t/);
      const nickname: string = message[0];
      const currentTime: number = formatCurrentTime(time); // 秒

      result.push({
        time,
        currentTime: formatCurrentTime(time),
        endTimeString: formatTime((currentTime + 3) * 1_000),
        nickname,
        message: message.slice(1).join(''),
        vid: String(index)
      });
    }

    index++;
  }

  return result;
}

export default formatDanmu;