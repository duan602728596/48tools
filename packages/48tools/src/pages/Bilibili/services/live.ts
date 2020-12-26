import got, { Response } from 'got';
import type { RoomInit, RoomPlayUrl } from './interface';

/**
 * 获取直播间的初始信息
 * @param { string } roomId
 */
export async function requestRoomInitData(roomId: string): Promise<RoomInit> {
  const res: Response<RoomInit> = await got(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${ roomId }`, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 获取直播间的直播地址
 * @param { string } roomId
 */
export async function requestRoomPlayerUrl(roomId: string): Promise<RoomPlayUrl> {
  const res: Response<RoomPlayUrl> = await got(`https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${ roomId }&qn=10000&platform=web`, {
    responseType: 'json'
  });

  return res.body;
}