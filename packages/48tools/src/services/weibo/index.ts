import got, { type Response as GotResponse } from 'got';
import type { PcLiveJson, VisitedList, DetailInfo, FollowContent } from './interface';

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

  console.log(res);

  return res.body;
}

/**
 * 获取访问列表
 * @param { string } gsid - cookie
 * @param { string } s - 抓包获得的
 * @param { string } from - 抓包获得的
 * @param { string } c - 设备类型
 */
export async function requestVisitedList(gsid: string, s: string, from: string, c: string): Promise<VisitedList> {
  const params: URLSearchParams = new URLSearchParams();

  params.set('c', c);
  params.set('from', from);
  params.set('gsid', gsid);
  params.set('s', s);

  const res: GotResponse<VisitedList> = await got.get(`https://api.weibo.cn/2/!/wbox/2pi6c3qvdd/getvisitedlist?${ params.toString() }`, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 获取关注列表
 * @param { string } cookie
 * @param { number } [page = 1]
 */
export async function requestSelfFollowedListPC(cookie: string, page: number = 1): Promise<FollowContent> {
  const res: GotResponse<FollowContent> = await got.get(`https://weibo.com/ajax/profile/followContent?page=${ page }&next_cursor=50`, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}

/**
 * 获取详细信息
 */
export async function requestDetailByUserId(id: string, cookie: string | undefined): Promise<DetailInfo> {
  const res: GotResponse<DetailInfo> = await got.get('https://weibo.com/ajax/profile/detail?uid=' + id, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}