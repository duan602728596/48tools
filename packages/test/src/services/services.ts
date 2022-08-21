import got, { type Response as GotResponse, type Delays } from 'got';
import type { BilibiliLiveListResponse } from './interface.js';

const gotOptionsTimeout: Delays = {
  lookup: 120_000,
  connect: 120_000,
  secureConnect: 120_000,
  socket: 120_000,
  send: 120_000,
  response: 180_000
};

/* 获取B站直播的列表 */
export async function getLiveList(): Promise<BilibiliLiveListResponse> {
  const res: GotResponse<BilibiliLiveListResponse> = await got.get(
    'https://api.live.bilibili.com/xlive/web-interface/v1/index/getList?platform=web', {
      responseType: 'json',
      timeout: gotOptionsTimeout
    });

  return res.body;
}

/* 获取acfun的直播html */
export async function getAcfunLiveHtml(): Promise<string> {
  const res: GotResponse<string> = await got.get('https://live.acfun.cn', {
    responseType: 'text',
    timeout: gotOptionsTimeout
  });

  return res.body;
}