import type { DanmuItem } from '../types';

const regexp: RegExp = /\[[^\[\]]+\]/;
const timeRegex: RegExp = /(\d+):(\d+):(\d+)\.(\d+)/;

/**
 * 格式化弹幕时间
 * [00:05:43.453]转换成秒
 * @param { string } time: 弹幕时间
 */
function formatCurrentTime(time: string): number {
  const match: RegExpMatchArray = timeRegex.exec(time)!;

  return (Number(match[1]) * 3600)
    + (Number(match[2]) * 60)
    + Number(match[3])
    + (Number(match[4]) / 1000);
}

/**
 * 解析弹幕
 * 弹幕格式为 [00:05:43.453]昵称\t弹幕内容
 * @param { string } str: 弹幕原始文本
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
    const noTime: string = item.replace(regexp, '');
    const message: string[] = noTime.split(/\t/);
    const nickname: string = message[0];

    result.push({
      time,
      currentTime: time ? formatCurrentTime(time) : undefined,
      nickname,
      message: message.slice(1).join(''),
      vid: String(index)
    });
    index++;
  }

  return result;
}

export default formatDanmu;