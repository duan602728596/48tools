import got, { type Response as GotResponse } from 'got';
import { getBilibiliCookie } from '../../../utils/utils';
import type { RoomInit, RoomPlayUrl } from './interface';

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
export async function requestRoomPlayerUrl(roomId: string): Promise<RoomPlayUrl> {
  const apiUrl: string = `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${ roomId }&qn=10000&platform=web`;
  const res: GotResponse<RoomPlayUrl> = await got(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    }
  });

  return res.body;
}