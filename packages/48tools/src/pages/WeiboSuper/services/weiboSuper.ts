import got, { type Response as GotResponse } from 'got';
import type { TopicResponse, CheckinResult } from './interface';

/**
 * 获取超话列表
 * @param { string } cookie
 * @param { number } page
 */
export async function requestTopicContent(cookie: string, page: number = 1): Promise<TopicResponse> {
  const uri: string = `https://weibo.com/ajax/profile/topicContent?tabid=231093_-_chaohua&page=${ page }`;
  const res: GotResponse<TopicResponse> = await got.get(uri, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}

/**
 * 签到
 * @param { string } cookie
 * @param { string } topicId: 超话id
 */
export async function requestTopicCheckin(cookie: string, topicId: string): Promise<CheckinResult> {
  const uri: string = `https://weibo.com/p/aj/general/button?api=http://i.huati.weibo.com/aj/super/checkin&id=${ topicId }`;
  const res: GotResponse<CheckinResult> = await got.get(uri, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}