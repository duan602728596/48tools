import * as querystring from 'node:querystring';
import got, { type Response as GotResponse } from 'got';

type MessageEventData = {
  param: string;
  video_id: string;
  suid: string;
  id: string;
};

/**
 * 随机字符串
 * TODO: webpack >= 5.13.0，主线程和worker线程同时引用会报错
 */
function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

/**
 * 新线程获取直播地址
 * TODO：48的网页会卡下次抓取，所以单独开启新线程来获得直播地址
 * @param { string } param
 * @param { string } video_id
 * @param { string } suid
 * @param { string } id
 */
async function requestStreamInfo(param: string, video_id: string, suid: string, id: string): Promise<void> {
  const res: GotResponse<string> = await got('https://live.48.cn/Index/get_streaminfo', {
    method: 'POST',
    responseType: 'text',
    body: querystring.stringify({ param, video_id, suid, id }),
    headers: {
      Host: 'live.48.cn',
      Referer: `https://live.48.cn/Index/inlive/id/${ id }`,
      Origin: 'https://live.48.cn',
      Cookie: `browser=liveweb${ rStr(8) }`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  });

  postMessage(JSON.parse(res.body));
}

addEventListener('message', function(event: MessageEvent<MessageEventData>) {
  const { param, video_id, suid, id }: MessageEventData = event.data;

  requestStreamInfo(param, video_id, suid, id);
});