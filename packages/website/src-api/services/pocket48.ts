import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../utils.js';
import type { LiveData, LiveRoomInfo, RoomInfo } from './interface';

/**
 * @param { string | number } next: 录播id分页
 * @param { boolean } inLive: 是否在直播中
 * @param { number | 'all' } groupId: 组
 * @param { string | number | undefined } userId: 用户id
 */
export async function requestLiveList(
  next: string,
  inLive: boolean,
  groupId?: number | 'all',
  userId?: string | number | undefined
): Promise<LiveData> {
  const body: {
    debug: boolean;
    next: string;
    groupId?: number;
    userId?: number;
    record?: boolean;
  } = { debug: true, next };

  if (inLive) {
    body.groupId = 0;
    body.record = false;
  }

  if (typeof userId === 'number') {
    body.userId = userId;
  } else if (typeof groupId === 'number') {
    body.groupId = groupId;
  }

  const res: GotResponse<LiveData> = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: body,
    timeout: { request: 60_000 }
  });

  return res.body;
}

/**
 * 获取单个直播间的信息
 * @param { string } id: 直播间id
 */
export async function requestLiveRoomInfo(id: string): Promise<LiveRoomInfo> {
  const res: GotResponse<LiveRoomInfo> = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { liveId: id },
    timeout: { request: 60_000 }
  });

  return res.body;
}

// 查询roomId
export async function requestRoomId(): Promise<RoomInfo> {
  const uri: string = 'https://raw.githubusercontent.com/duan602728596/qqtools/main/packages/NIMTest/node/roomId.json';
  const res: GotResponse<RoomInfo> = await got.get(uri, {
    responseType: 'json',
    timeout: { request: 60_000 }
  });

  return res.body;
}