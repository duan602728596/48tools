import * as fs from 'fs';

/* 获取ffmpeg的地址 */
export function getFFmpeg(): string {
  const ffmpegPath: string | null = localStorage.getItem('FFMPEG_PATH'); // 本机配置

  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    return ffmpegPath;
  }

  return 'ffmpeg';
}

/* 随机字符串 */
export function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

/* 拼接静态文件地址 */
export function source(pathname: string): string {
  return `https://source3.48.cn/${ pathname }`;
}