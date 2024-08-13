'use idle';

import { pipeline } from 'node:stream/promises';
import * as fs from 'node:fs';
import got, { type Response as GotResponse, type Headers as GotHeaders } from 'got';
import { createHeaders, getPocket48Token } from '../../utils/snh48';
import type {
  LiveInfo,
  LiveData,
  LiveRoomInfo,
  ServerSearchResult,
  ServerJumpResult,
  HomeMessageResult,
  VoiceOperate,
  FriendShipAdd,
  LiveOne,
  LiveStream,
  RoomInfo,
  OpenLiveList
} from './interface';

export type * from './interface';

/**
 * 获取单个直播间的信息
 * @param { string } id - 直播间id
 */
export async function requestLiveRoomInfo(id: string): Promise<LiveRoomInfo> {
  const res: GotResponse<LiveRoomInfo> = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: { liveId: id },
    timeout: 10 * 60 * 1_000
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
 *   CGT48：21
 *   IDFT：15
 *   海外练习生：16
 * @param { string | number } next - 录播id分页
 * @param { boolean } inLive - 是否在直播中
 * @param { number | 'all' } groupId - 组
 * @param { string | number | undefined } userId - 用户id
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

  // 直播
  if (inLive) {
    body.groupId = 0;
    body.record = false;
  }

  // 录播
  const isUserQuery: boolean = typeof userId === 'number' || (typeof userId === 'string' && !/^\s*$/.test(userId));
  let firstData: LiveInfo | null = null;

  if (isUserQuery && Number(next) === 0) {
    // fix: 当next为0时，无法根据userId查询到指定的数据，所以取列表最新的liveId作为next参数
    const firstRes: LiveData = await requestLiveList('0', false);

    if (firstRes.content?.liveList?.[0]) {
      body.next = firstRes.content.liveList[0].liveId;

      if (firstRes.content.liveList[0].userInfo.userId === userId) {
        firstData = firstRes.content.liveList[0];
      }
    }
  }

  if (isUserQuery) {
    body.userId = Number(userId);
  } else if (typeof groupId === 'number') {
    body.groupId = groupId;
  }

  const res: GotResponse<LiveData> = await got('https://pocketapi.48.cn/live/api/v1/live/getLiveList', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: body,
    timeout: 10 * 60 * 1_000
  });

  if (firstData && res?.body?.content?.liveList) {
    res.body.content.liveList.unshift(firstData);
  }

  return res.body;
}

/* server search */
export async function requestServerSearch(searchContent: string): Promise<ServerSearchResult | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<ServerSearchResult> = await got('https://pocketapi.48.cn/im/api/v1/im/server/search', {
    method: 'POST',
    headers: createHeaders(token),
    responseType: 'json',
    json: { searchContent }
  });

  return res.body;
}

/* server jump */
export async function requestServerJump(id: number): Promise<ServerJumpResult | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<ServerJumpResult> = await got('https://pocketapi.48.cn/im/api/v1/im/server/jump', {
    method: 'POST',
    headers: createHeaders(token),
    responseType: 'json',
    json: {
      starId: id,
      targetType: 1
    }
  });

  return res.body;
}

/**
 * 请求口袋房间的信息
 * @param { number } channelId - 频道ID
 * @param { number } serverId - 服务的ID
 * @param { number } [nextTime = 0] - 查询的位置
 */
export async function requestHomeownerMessage(
  channelId: number,
  serverId: number,
  nextTime: number = 0
): Promise<HomeMessageResult | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<HomeMessageResult> = await got(
    'https://pocketapi.48.cn/im/api/v1/team/message/list/homeowner', {
      method: 'POST',
      headers: createHeaders(token),
      responseType: 'json',
      json: {
        channelId,
        serverId,
        nextTime,
        limit: 700
      }
    });

  return res.body;
}

/**
 * 房间电台
 * @param { number } serverId
 * @param { number } channelId
 */
export async function requestVoiceOperate(serverId: number, channelId: number): Promise<VoiceOperate | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<VoiceOperate> = await got('https://pocketapi.48.cn/im/api/v1/team/voice/operate', {
    method: 'POST',
    headers: createHeaders(token),
    responseType: 'json',
    json: { serverId, channelId, operateCode: 2 }
  });

  return res.body;
}

/**
 * 下载文件
 * @param { string } fileUrl - 文件url地址
 * @param { string } filename - 文件本地地址
 */
export async function requestDownloadFileByStream(fileUrl: string, filename: string): Promise<void> {
  await pipeline(got.stream(fileUrl), fs.createWriteStream(filename));
}

/**
 * 下载文件
 * @param { string } fileUrl - 文件url地址
 * @param { GotHeaders } [headers] - headers
 */
export async function requestDownloadFile(fileUrl: string, headers?: GotHeaders): Promise<string> {
  const res: GotResponse<string> = await got(fileUrl, {
    method: 'GET',
    responseType: 'text',
    headers
  });

  return res.body;
}

/* 关注 */
export async function requestFriendshipAdd(toSourceId: number): Promise<FriendShipAdd | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<FriendShipAdd> = await got.post('https://pocketapi.48.cn/user/api/v2/friendships/friends/add', {
    headers: createHeaders(token),
    responseType: 'json',
    json: {
      toSourceId,
      toType: 1
    }
  });

  return res.body;
}

/* 获取公演直播或录播列表 */
export async function requestOpenLiveList(args: {
  groupId?: number;
  next?: string;
  record?: boolean;
} = {}): Promise<OpenLiveList> {
  const res: GotResponse<OpenLiveList> = await got.post('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveList', {
    headers: createHeaders(),
    responseType: 'json',
    json: {
      debug: false,
      groupId: args.groupId ?? 0,
      next: args.next ? Number(args.next) : 0,
      record: args.record ?? false
    }
  });

  return res.body;
}

/**
 * 获取直播地址（app）
 * @param { string } liveId
 * @param { string } [token]
 */
export async function requestLiveOne(liveId: string, token?: string): Promise<LiveOne> {
  const res: GotResponse<LiveOne> = await got('https://pocketapi.48.cn/live/api/v1/live/getOpenLiveOne', {
    method: 'POST',
    headers: createHeaders(token),
    responseType: 'json',
    json: { liveId },
    timeout: 10 * 60 * 1_000
  });

  return res.body;
}

/**
 * 获取直播流
 * @param { string } liveId
 * @param { string } [token]
 */
export async function requestLiveStream(liveId: string, token?: string): Promise<LiveStream> {
  const res: GotResponse<LiveStream> = await got('https://pocketapi.48.cn/live/api/v1/live/getlivestream', {
    method: 'POST',
    headers: createHeaders(token),
    responseType: 'json',
    json: { liveId, streamType: 3 },
    timeout: 10 * 60 * 1_000
  });

  return res.body;
}

/**
 * 获取roomInfo
 * @param { string } channelId
 */
export async function requestRoomInfo(channelId: string | number): Promise<RoomInfo | undefined> {
  const token: string | undefined = getPocket48Token();

  if (!token) return;

  const res: GotResponse<RoomInfo> = await got.post('https://pocketapi.48.cn/im/api/v1/im/team/room/info', {
    headers: createHeaders(token),
    responseType: 'json',
    json: { channelId: `${ channelId }` }
  });

  return res.body;
}