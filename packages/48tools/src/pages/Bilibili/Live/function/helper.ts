export function ffmpegHeaders(): string {
  return `Referer: https://live.bilibili.com\r
Host: live.bilibili.com\r\n`;
}

export const localStorageKey: string = 'BILIBILI_AUTO_RECORD_SAVE_PATH';