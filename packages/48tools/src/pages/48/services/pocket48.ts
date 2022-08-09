import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';
import got, { type Response as GotResponse, type Headers as GotHeaders } from 'got';
import { createHeaders } from '../../../utils/snh48';
import type { LiveData, LiveRoomInfo } from './interface';

/**
 * 获取单个直播间的信息
 * @param { string } id: 直播间id
 */
export async function requestLiveRoomInfo(id: string): Promise<LiveRoomInfo> {
  const res: GotResponse<LiveRoomInfo> = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { liveId: id }
  });

  return res.body;
}

/**
 * 获取直播和录播信息数据（https://pocketapi.48.cn/live/api/v1/live/getLiveList）
 * groupId:
 *   明星殿堂：19
 *   THE9：17
 *   硬糖少女303：18
 *   丝芭影视：20
 *   SNH48：10
 *   BEJ48：11
 *   GNZ48：12
 *   CKG48：14
 *   IDFT：15
 *   海外练习生：16
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
    json: body
  });

  return res.body;
}

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { string } filename: 文件本地地址
 */
export async function requestDownloadFileByStream(fileUrl: string, filename: string): Promise<void> {
  await pipeline(got.stream(fileUrl), fs.createWriteStream(filename));
}

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { GotHeaders } headers: headers
 */
export async function requestDownloadFile(fileUrl: string, headers?: GotHeaders): Promise<string> {
  const res: GotResponse<string> = await got(fileUrl, {
    method: 'GET',
    responseType: 'text',
    headers
  });

  return res.body;
}