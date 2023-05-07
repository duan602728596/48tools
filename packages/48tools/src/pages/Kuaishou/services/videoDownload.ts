import got, { Response as GotResponse } from 'got';
import { pcUserAgent, rStr } from '../../../utils/utils';
import type { ShortVideoDownloadResponse } from './interface';

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