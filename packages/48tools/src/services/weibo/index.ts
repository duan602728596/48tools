import got, { type Response as GotResponse } from 'got';
import type { PcLiveJson, VisitedList } from './interface';

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

/**
 * 获取访问列表
 * @param { string } gsid - cookie
 */
export async function requestVisitedList(gsid: string): Promise<VisitedList> {
  const params: URLSearchParams = new URLSearchParams();

  params.set('c', 'iphone');
  params.set('from', '10E4093010');
  params.set('gsid', gsid);
  params.set('s', '24f77d28');

  const res: GotResponse<VisitedList> = await got.get(`https://api.weibo.cn/2/!/wbox/2pi6c3qvdd/getvisitedlist?${ params.toString() }`, {
    responseType: 'json'
  });

  return res.body;
}