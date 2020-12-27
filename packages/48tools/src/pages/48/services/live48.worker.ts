import * as querystring from 'querystring';
import got, { Response as GotResponse } from 'got';
import { rStr } from '../../../utils/utils';

type MessageEventData = {
  param: string;
  video_id: string;
  suid: string;
  id: string;
};

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

  // @ts-ignore
  postMessage(JSON.parse(res.body));
}

addEventListener('message', function(event: MessageEvent<MessageEventData>) {
  const { param, video_id, suid, id }: MessageEventData = event.data;

  requestStreamInfo(param, video_id, suid, id);
});