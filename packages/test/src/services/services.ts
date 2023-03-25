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

/* 获取acfun的直播html */
export async function requestAcfunLiveList(): Promise<AcfunLiveListResponse> {
  const res: GotResponse<AcfunLiveListResponse> = await got.get(
    'https://live.acfun.cn/api/channel/list?count=100&pcursor=1', {
      responseType: 'json',
      timeout: gotOptionsTimeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          + ' (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69',
        Host: 'live.acfun.cn',
        Referer: 'https://live.acfun.cn/',
        Cookie: '_did=web_928601709119133;'
      }
    });

  return res.body;
}