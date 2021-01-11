import { promisify } from 'util';
import { pipeline } from 'stream';
import * as fs from 'fs';
import got, { Response } from 'got';
import type { ProgressEventData } from '../types';
import type { VideoInfo, AudioInfo, BangumiVideoInfo } from './interface';

const pipelineP: (stream1: NodeJS.ReadableStream, stream2: NodeJS.WritableStream) => Promise<void> = promisify(pipeline);

const USER_AGENT: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/84.0.4147.38 Safari/537.36 Edg/84.0.522.15';

// B站api参考：https://github.com/SocialSisterYi/bilibili-API-collect
// 请求bilibili的html
export async function requestBilibiliHtml(url: string): Promise<string> {
  const res: Response<string> = await got.get(url, {
    responseType: 'text',
    headers: {
      Host: 'www.bilibili.com',
      'User-Agent': USER_AGENT
    }
  });

  return res.body;
}

/**
 * 请求视频信息
 * @param { string } payload: 查询参数
 * @param { string } sign: 加密后的sign
 */
export async function requestVideoInfo(payload: string, sign: string): Promise<VideoInfo> {
  const apiUrl: string = `https://interface.bilibili.com/v2/playurl?${ payload }&sign=${ sign }`;
  const res: Response<VideoInfo> = await got.get(apiUrl, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 请求番剧信息
 * @param { number } aid
 * @param { number } cid
 * @param { string } SESSDATA: cookie
 */
export async function requestBangumiVideoInfo(aid: number, cid: number, SESSDATA?: string): Promise<BangumiVideoInfo> {
  const apiUrl: string = `https://api.bilibili.com/x/player/playurl?avid=${ aid }&cid=${ cid }&qn=112`;
  const options: any = {
    responseType: 'json'
  };

  if (SESSDATA && !/^\s*$/.test(SESSDATA)) {
    options.headers = {
      Cookie: `SESSDATA=${ SESSDATA }`
    };
  }

  const res: Response<BangumiVideoInfo> = await got.get(apiUrl, options);

  return res.body;
}

/**
 * 请求音频信息
 * @param { string } auid: 音频id
 */
export async function requestAudioInfo(auid: string): Promise<AudioInfo> {
  const apiUrl: string = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${ auid }&privilege=2&quality=2`;
  const res: Response<AudioInfo> = await got.get(apiUrl, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 下载文件
 * @param { string } fileUrl: 文件url地址
 * @param { string } filename: 文件本地地址
 * @param { (e: ProgressEventData) => void } onProgress: 进度条
 */
export async function requestDownloadFileByStream(
  fileUrl: string,
  filename: string,
  onProgress: (e: ProgressEventData) => void
): Promise<void> {
  await pipelineP(
    got.stream(fileUrl, {
      headers: {
        referer: 'https://www.bilibili.com/'
      }
    }).on('downloadProgress', onProgress),
    fs.createWriteStream(filename)
  );
}