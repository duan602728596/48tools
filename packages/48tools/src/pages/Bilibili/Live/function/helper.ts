import type { RoomPlayUrlV2 } from '@48tools-api/bilibili/live';

export function ffmpegHeaders(): string {
  return `Referer: https://live.bilibili.com\r
Host: live.bilibili.com\r\n`;
}

export const localStorageKey: string = 'BILIBILI_AUTO_RECORD_SAVE_PATH';

/* 生成直播链接 */
export function createV2LiveUrl(resPlayUrl: RoomPlayUrlV2): string | null {
  let playStreamPath: string | null = null;

  if (!(resPlayUrl.data.live_status === 1 && resPlayUrl?.data?.playurl_info?.playurl?.stream?.length)) {
    return playStreamPath;
  }

  for (const stream of resPlayUrl.data.playurl_info.playurl.stream) {
    for (const format of stream.format) {
      playStreamPath = format.codec[0].url_info[0].host + format.codec[0].base_url + format.codec[0].url_info[0].extra;

      return playStreamPath;
    }
  }

  return playStreamPath;
}