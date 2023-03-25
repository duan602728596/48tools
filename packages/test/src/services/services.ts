import got, { type Response as GotResponse, type Delays } from 'got';
import type { BilibiliLiveListResponse, AcfunLiveListResponse } from './interface.js';

const gotOptionsTimeout: Delays = {
  lookup: 120_000,
  connect: 120_000,
  secureConnect: 120_000,
  socket: 120_000,
  send: 120_000,
  response: 180_000
};

/* 获取B站直播的列表 */
export async function requestBilibiliLiveList(): Promise<BilibiliLiveListResponse> {
  const res: GotResponse<BilibiliLiveListResponse> = await got.get(
    'https://api.live.bilibili.com/xlive/web-interface/v1/index/getList?platform=web', {
      responseType: 'json',
      timeout: gotOptionsTimeout
    });

  return res.body;
}

const acfunHeaders: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    + ' (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69',
  Host: 'live.acfun.cn',
  Referer: 'https://live.acfun.cn/'
};

/* 获取acfun的html */
async function requestAcfunHtml(): Promise<string> {
  const res: GotResponse<string> = await got.get('http://www.acfun.cn/', {
    responseType: 'text',
    headers: acfunHeaders
  });

  return (res?.headers?.['set-cookie'] ?? []).join('; ');
}

/* 获取acfun的直播列表 */
export async function requestAcfunLiveList(): Promise<AcfunLiveListResponse> {
  const cookie: string = await requestAcfunHtml();
  const res: GotResponse<AcfunLiveListResponse> = await got.get(
    'https://live.acfun.cn/api/channel/list?count=100&pcursor=0', {
      responseType: 'json',
      timeout: gotOptionsTimeout,
      headers: {
        ...acfunHeaders,
        Cookie: cookie
      }
    });

  return res.body;
}