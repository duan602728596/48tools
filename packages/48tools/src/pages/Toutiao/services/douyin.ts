import got, { Response as GotResponse } from 'got';

/**
 * 获取抖音网页的html
 * @param { string } id: 视频id
 */
export async function requestDouyinVideoHtml(id: string): Promise<string> {
  const res: GotResponse<string> = await got.get(`https://www.douyin.com/video/${ id }`, {
    responseType: 'text'
  });

  return res.body;
}

/**
 * 抖音302地址的处理
 * @param { string } uri
 */
export async function requestGetVideoRedirectUrl(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Host: 'www.douyin.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/91.0.4472.164 Safari/537.36'
    },
    followRedirect: false
  });

  return res.body;
}