// @ts-expect-error
import got, { type Response as GotResponse } from 'got';

export type * from './interface';

/**
 * 获取小红书直播的livestream
 * @param { string } roomId - 直播间id
 * @param { string } [dynpath] - 目前发现不影响直播间的请求
 */
export async function requestXiaohongshuLiveStream(roomId: string, dynpath: string = 'dynpathpYJesOPX'): Promise<string> {
  const res: GotResponse<string> = await got.get(`https://www.xiaohongshu.com/livestream/${ dynpath }/${ roomId }`, {
    responseType: 'text'
  });

  return res.body;
}