import got, { type Response as GotResponse } from 'got';

type MessageEventData = {
  roomId: string;
  cookie: string | undefined;
};

/**
 * 获取acfun直播的html和cookie
 * @param { string } roomId: 直播间id
 * @param { string | undefined } acfunCookie
 */
export async function requestAcFunLiveHtml(roomId: string, acfunCookie: string | undefined): Promise<void> {
  const res: GotResponse<string> = await got.get(`https://live.acfun.cn/live/${ roomId }`, {
    responseType: 'text',
    headers: {
      Cookie: acfunCookie
    }
  });
  const cookie: string = res.headers['set-cookie']![0]
    .split(/;\s*/)[0] // _did=
    .split(/=/)[1];   // did的值

  // 获取cookie中的_did值
  postMessage(cookie);
}

addEventListener('message', function(event: MessageEvent<MessageEventData>): void {
  const { roomId, cookie }: MessageEventData = event.data;

  requestAcFunLiveHtml(roomId, cookie);
}, false);