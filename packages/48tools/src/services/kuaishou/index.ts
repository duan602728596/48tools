import got, { Response as GotResponse } from 'got';
import { pcUserAgent, rStr } from '../../utils/utils';
import type { ShortVideoDownloadResponse } from './interface';

export type * from './interface';

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

/**
 * 请求视频地址
 */
export async function requestShortVideo(id: string, cookie?: string): Promise<ShortVideoDownloadResponse> {
  const res: GotResponse<ShortVideoDownloadResponse> = await got.post('https://www.kuaishou.com/graphql', {
    responseType: 'json',
    headers: {
      'User-Agent': pcUserAgent,
      Host: 'www.kuaishou.com',
      Cookie: cookie ?? `did=web_${ rStr(31) }`
    },
    json: {
      operationName: 'visionVideoDetail',
      query: /* GraphQL */ `
query visionVideoDetail($photoId: String, $type: String, $page: String, $webPageArea: String) {
    visionVideoDetail(photoId: $photoId, type: $type, page: $page, webPageArea: $webPageArea) {
        photo {
            caption
            manifest {
                adaptationSet {
                    representation {
                        url
                    }
                }
            }
        }
    }
}`,
      variables: {
        photoId: id,
        type: '',
        page: 'detail',
        webPageArea: 'brilliantxxcarefully'
      }
    }
  });

  return res.body;
}