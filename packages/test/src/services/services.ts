import got, { type Response as GotResponse } from 'got';
import type { LiveListResponse } from './interface.js';

/* 获取B站直播的列表 */
export async function getLiveList(): Promise<LiveListResponse> {
  const res: GotResponse<LiveListResponse> = await got.get(
    'https://api.live.bilibili.com/xlive/web-interface/v1/index/getList?platform=web', {
      responseType: 'json',
      timeout: {
        lookup: 120_000,
        connect: 120_000,
        secureConnect: 120_000,
        socket: 120_000,
        send: 120_000,
        response: 180_000
      }
    });

  return res.body;
}