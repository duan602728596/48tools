import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../../../utils/snh48';
import type { LiveOne } from './interface';

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
 * 获取直播地址（app）
 * @param { string } liveId
 */
export async function requestLiveOne(liveId: string): Promise<LiveOne> {
  const res: GotResponse<LiveOne> = await got('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveOne', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { liveId }
  });

  return res.body;
}