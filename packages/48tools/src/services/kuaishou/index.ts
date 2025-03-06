// @ts-expect-error
import got, { Response as GotResponse } from 'got';
import { pcUserAgent, rStr } from '../../utils/utils';
import type { ShortVideoDownloadResponse } from './interface';

export type * from './interface';

/**
 * 请求快手直播的网站，并返回html
 * @param { string } id - 直播间的ID
 * @param { string } cookie
 */
export async function requestLiveHtml(id: string, cookie?: string): Promise<string> {
  const res: Response = await fetch(`https://live.kuaishou.com/u/${ id }`, {
    headers: {
      Cookie1: cookie ?? `did=web_${ rStr(31) }`
    }
  });

  return res.text();
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