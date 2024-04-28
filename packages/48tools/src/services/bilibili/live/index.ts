import got, { type Response as GotResponse } from 'got';
import type { _PlayUrlObject } from '../../../../../main/src/logProtocol/logTemplate/bilibiliLive.mjs';
import { getBilibiliCookie } from '../../../utils/utils';
import { _bilibiliLiveLogProtocol } from '../../../utils/logProtocol/logActions';
import type { RoomInit, RoomPlayUrlV2 } from './interface';

export type * from './interface';

/**
 * 获取直播间的初始信息
 * @param { string } roomId
 */
export async function requestRoomInitData(roomId: string): Promise<RoomInit> {
  const apiUrl: string = `https://api.live.bilibili.com/room/v1/Room/room_init?id=${ roomId }`;
  const res: GotResponse<RoomInit> = await got(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    }
  });

  return res.body;
}

/**
 * 获取直播间的直播地址
 * @param { string } roomId
 */
export async function requestRoomPlayerUrlV2(roomId: string): Promise<RoomPlayUrlV2> {
  const uri: string = `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${ roomId }`
    + '&protocol=0,1&format=0,1,2&codec=0,1,2&qn=10000&platform=web&ptype=8&dolby=5&panorama=1';
  const res: GotResponse<RoomPlayUrlV2> = await got.get(uri, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    }
  });

  _bilibiliLiveLogProtocol.post<_PlayUrlObject>('playurl', {
    roomId,
    response: JSON.stringify(res.body, null, 2)
  });

  return res.body;
}