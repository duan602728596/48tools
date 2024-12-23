// @ts-ignore
import got, { type Response as GotResponse } from 'got';
import { createMeet48Headers } from '../../../utils/snh48';
import { timeoutOptions } from '../index';
import type { LiveData, LiveOne } from '../interface';

/**
 * 获取直播和录播信息数据
 */
export async function requestLiveList(next?: string, record?: boolean): Promise<LiveData> {
  const body: {
    title: null;
    next: number | string;
    record: boolean;
  } = {
    title: null,
    next: 0,
    record: false // false：直播 true：录播
  };

  if (next) body.next = next;

  if (record) body.record = record;

  const res: GotResponse<LiveData> = await got.post('https://meetapi-v2.meet48.xyz/meet48-api/live/api/v1/live/getLiveList', {
    responseType: 'json',
    headers: createMeet48Headers(),
    json: body,
    timeout: timeoutOptions
  });

  return res.body;
}

/**
 * 获取直播地址
 * @param { string } liveId
 */
export async function requestLiveOne(liveId: string): Promise<LiveOne> {
  const res: GotResponse<LiveOne> = await got.post('https://meetapi-v2.meet48.xyz/meet48-api/live/api/v1/live/getOpenLiveOne', {
    responseType: 'json',
    headers: createMeet48Headers(),
    json: {
      liveId,
      streamProtocol: 'RTMP'
    },
    timeout: timeoutOptions
  });

  return res.body;
}