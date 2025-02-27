// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import type { StreamingUrl } from './interface';

export type * from './interface';

/**
 * 请求html用于解析
 * @param { string } userId - 用户id
 * @return { Promise<string> } - 返回html，用于解析直播id
 */
export async function requestHtml(userId: string): Promise<string> {
  const res: GotResponse<string> = await got.get(`https://www.showroom-live.com/r/${ userId }`, {
    type: 'text'
  });

  return res.body;
}

/**
 * 请求直播地址
 * @param { string } id - 直播id
 * @return { Promise<StreamingUrl> } - 返回直播地址，从[1]开始为高画质
 */
export async function requestStreamingUrl(id: string): Promise<StreamingUrl> {
  const res: GotResponse<StreamingUrl> = await got.get(`https://www.showroom-live.com/api/live/streaming_url?room_id=${ id }&abr_available=1`, {
    responseType: 'json'
  });

  return res.body;
}