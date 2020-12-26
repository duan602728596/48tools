import * as querystring from 'querystring';
import got, { Response as GotResponse } from 'got';
import { rStr } from '../../../utils/utils';
import type { LiveStreamInfo } from './interface';

/**
 * 抓取网页地址
 * TODO: 48的网页会卡下次抓取，所以使用fetch来抓取
 * @param { string } uri: 网页地址
 */
export async function requestFetchHtml(uri: string): Promise<string> {
  const res: Response = await fetch(uri);

  return await res.text();
}

/**
 * 获取直播地址
 * @param { string } param
 * @param { string } video_id
 * @param { string } suid
 * @param { string } id
 */
export async function requestStreamInfo(param: string, video_id: string, suid: string, id: string): Promise<LiveStreamInfo> {
  const res: GotResponse<string> = await got('https://live.48.cn/Index/get_streaminfo', {
    method: 'POST',
    responseType: 'text',
    body: querystring.stringify({ param, video_id, suid, id }),
    headers: {
      Host: 'live.48.cn',
      Referer: `https://live.48.cn/Index/inlive/id/${ id }`,
      Origin: 'https://live.48.cn',
      Cookie: `browser=${ rStr(8) }`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  });

  return JSON.parse(res.body);
}