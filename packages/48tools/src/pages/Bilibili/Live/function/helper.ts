import type { RoomPlayUrlV2 } from '@48tools-api/bilibili/live';

export function ffmpegHeaders(): string {
  return 'Referer: https://live.bilibili.com\r\n';
}

/**
 * 判断是否为B站CDN地址
 * @param { string } u
 */
export function isCNCdnHost(u: string): boolean {
  const url: URL = new URL(u);

  return /cn/i.test(url.host);
}

export const localStorageKey: string = 'BILIBILI_AUTO_RECORD_SAVE_PATH';

/**
 * 生成直播链接
 * 境内地址：https://cn-hljheb-ct-01-02.bilivideo.com/live-bvc/487336/live_6210612_9429608.flv
 * 境外地址：https://d1--ov-gotcha07.bilivideo.com/live-bvc/450162/live_6210612_9429608.flv
 */
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