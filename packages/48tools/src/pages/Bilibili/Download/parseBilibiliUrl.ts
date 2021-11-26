import { createHash, Hash } from 'node:crypto';
import { requestBilibiliHtml, requestVideoInfo, requestAudioInfo, requestBangumiVideoInfo } from '../services/download';
import type { InitialState } from '../types';
import type { VideoInfo, AudioInfo, BangumiVideoInfo } from '../services/interface';

// b站请求接口需要的key
const APP_KEY: string = 'iVGUTjsxvpLeuDCf';
const BILIBILI_KEY: string = 'aHRmhWMLkdeMuILqORnYZocwMBpMEOdt';

// 查询参数
const QUERY_ARRAY: [string, string] = ['qn=116&quality=80&type=', 'quality=2&type=mp4'];

interface ParseHtmlResult {
  initialState?: InitialState;
  h1Title: string;
}

/* md5加密 */
function md5Crypto(data: string): string {
  const md5Hash: Hash = createHash('md5');

  md5Hash.update(data);

  return md5Hash.digest('hex');
}

/**
 * 解析initialState
 * @param { string } html
 */
function parseHtml(html: string): ParseHtmlResult {
  const document: Document = new DOMParser().parseFromString(html, 'text/html');
  const scripts: NodeListOf<HTMLScriptElement> = document.querySelectorAll('script');
  let initialState: InitialState | undefined = undefined;

  for (const script of scripts) {
    const scriptStr: string = script.innerHTML;

    if (/^window\._{2}INITIAL_STATE_{2}\s*=\s*.+$/.test(scriptStr)) {
      const str: string = scriptStr
        .replace(/window\._{2}INITIAL_STATE_{2}\s*=\s*/, '') // 剔除"="前面的字符串
        .replace(/;\(function\(\){var s;.+$/i, '');          // 剔除后面可能存在的函数

      initialState = JSON.parse(str);
      break;
    }
  }

  return {
    initialState,
    h1Title: document.querySelector('#viewbox_report .tit')?.innerHTML ?? ''
  };
}

/**
 * 解析视频url
 * @param { string } type: 视频类型
 * @param { string } id: 视频id
 * @param { number } page: 分页
 */
export async function parseVideoUrl(type: string, id: string, page: number = 1): Promise<string | void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ type === 'av' ? 'av' : 'BV' }${ id }?p=${ page }`;
  const html: string = await requestBilibiliHtml(videoUrl);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  const { cid }: { cid: number; part: string } = initialState.videoData.pages[page - 1]; // cid
  let flvUrl: string | undefined = undefined; // 视频地址

  for (const query of QUERY_ARRAY) {
    const payload: string = `appkey=${ APP_KEY }&cid=${ cid }&otype=json&page=${ page }&${ query }`;
    const sign: string = md5Crypto(`${ payload }${ BILIBILI_KEY }`);
    const videoInfoRes: VideoInfo = await requestVideoInfo(payload, sign);

    if (videoInfoRes?.durl?.length) {
      flvUrl = videoInfoRes.durl[0].url;
      break;
    }
  }

  return flvUrl;
}

/**
 * 解析视频列表地址
 * @param { string } bvid
 */
export async function parseVideoList(bvid: string): Promise<Array<{ cid: number; part: string }> | void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ bvid }`;
  const html: string = await requestBilibiliHtml(videoUrl);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  return initialState.videoData.pages;
}

/**
 * 解析番剧的接口
 * 参考：https://github.com/Henryhaohao/Bilibili_video_download/blob/master/bilibili_video_download_bangumi.py
 * @param { string } type: 番剧类型
 * @param { string } id: 番剧id
 */
export async function parseBangumiVideo(type: string, id: string): Promise<string | void> {
  const videoUrl: string = `https://www.bilibili.com/bangumi/play/${ type }${ id }`;
  const html: string = await requestBilibiliHtml(videoUrl);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  const { aid, cid }: { aid: number; cid: number } = initialState.epInfo;
  const res: BangumiVideoInfo = await requestBangumiVideoInfo(aid, cid);

  if (res.data) {
    return res.data.durl[0].url;
  } else {
    return undefined;
  }
}

/**
 * 解析音频地址
 * @param { string } id: 音频id
 */
export async function parseAudioUrl(id: string): Promise<string | void> {
  const res: AudioInfo = await requestAudioInfo(id);

  return res.data.cdns?.[0];
}