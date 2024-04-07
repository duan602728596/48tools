import got, { type Response as GotResponse } from 'got';
import type { PcLiveJson } from './interface';

export type * from './interface';

/**
 * 获取微博直播地址
 * @param { string } liveId
 */
export async function requestPcLiveJson(liveId: string): Promise<PcLiveJson> {
  const res: GotResponse<PcLiveJson> = await got.get(`https://weibo.com/l/!/2/wblive/room/show_pc_live.json?live_id=${ liveId }`, {
    responseType: 'json',
    headers: {
      Referer: `https://weibo.com/l/wblive/p/show/${ liveId }`
    }
  });

  return res.body;
}