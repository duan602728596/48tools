import got, { Response as GotResponse } from 'got';
import { pcUserAgent } from '../../../utils/utils';

/**
 * 请求快手直播的网站，并返回html
 * @param { string } id: 直播间的ID
 */
export async function requestLiveHtml(id: string): Promise<string> {
  const res: GotResponse<string> = await got.get(`https://live.kuaishou.com/u/${ id }`, {
    responseType: 'text',
    headers: {
      'User-Agent': pcUserAgent,
      Host: 'live.kuaishou.com'
    }
  });

  return res.body;
}