import got, { type Response as GotResponse } from 'got';

const userAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/91.0.4472.164 Safari/537.36';

// 抖音可能返回中间页，需要根据cookie判断一下
export interface DouyinVideo {
  type: 'html' | 'cookie';
  value: string;
}

/**
 * 获取抖音网页的html
 * @param { string } id: 视频id
 * @param { string } cookie: __ac_nonce和__ac_signature
 */
export async function requestDouyinVideoHtml(id: string, cookie: string = ''): Promise<DouyinVideo> {
  const res: GotResponse<string> = await got.get(`https://www.douyin.com/video/${ id }`, {
    responseType: 'text',
    headers: {
      'User-Agent': userAgent,
      Cookie: '__ac_referer=__ac_blank;' + cookie,
      Host: 'www.douyin.com'
    }
  });

  // 判断是否有__ac_nonce
  if (res.headers['set-cookie']) {
    const val: string | undefined = res.headers['set-cookie'].find((o: string): boolean => o.includes('__ac_nonce'));

    if (val) {
      return {
        type: 'cookie',
        value: val.split(/s*;s*/)[0].split(/=/)[1]
      };
    }
  }

  return {
    type: 'html',
    value: res.body
  };
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
      'User-Agent': userAgent
    },
    followRedirect: false
  });

  return res.body;
}