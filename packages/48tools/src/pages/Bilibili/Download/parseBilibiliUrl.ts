import { createHash, type Hash } from 'node:crypto';
import {
  requestBilibiliHtml,
  requestVideoInfo,
  requestAudioInfo,
  requestBangumiVideoInfo,
  requestWebInterfaceView
} from '../services/download';
import type { InitialState } from '../types';
import type {
  VideoInfo,
  AudioInfo,
  BangumiVideoInfo,
  WebInterfaceViewData,
  WebInterfaceViewDataPageItem
} from '../services/interface';

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
  const parseDocument: Document = new DOMParser().parseFromString(html, 'text/html');
  const scripts: NodeListOf<HTMLScriptElement> = parseDocument.querySelectorAll('script');
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
    h1Title: parseDocument.querySelector('#viewbox_report .tit')?.innerHTML ?? ''
  };
}

/**
 * @deprecated: 使用parseVideoUrlV2方法，通过接口请求信息
 * 解析视频url
 * @param { string } type: 视频类型
 * @param { string } id: 视频id
 * @param { number } page: 分页
 * @param { boolean } proxy: 是否使用代理
 */
export async function parseVideoUrl(type: string, id: string, page: number = 1, proxy: boolean): Promise<string | void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ type === 'av' ? 'av' : 'BV' }${ id }?p=${ page }`;
  const html: string = await requestBilibiliHtml(videoUrl, proxy);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  const { cid }: { cid: number; part: string } = initialState.videoData.pages[page - 1]; // cid
  let flvUrl: string | undefined = undefined; // 视频地址

  for (const query of QUERY_ARRAY) {
    const payload: string = `appkey=${ APP_KEY }&cid=${ cid }&otype=json&page=${ page }&${ query }`;
    const sign: string = md5Crypto(`${ payload }${ BILIBILI_KEY }`);
    const videoInfoRes: VideoInfo = await requestVideoInfo(payload, sign, proxy);

    if (videoInfoRes?.durl?.length) {
      flvUrl = videoInfoRes.durl[0].url;
      break;
    }
  }

  return flvUrl;
}

/**
 * 解析视频url
 * @param { string } type: 视频类型
 * @param { string } id: 视频id
 * @param { number } page: 分页
 * @param { boolean } proxy: 是否使用代理
 */
export async function parseVideoUrlV2(
  type: string,
  id: string,
  page: number = 1,
  proxy: boolean
): Promise<{ flvUrl: string; pic: string } | undefined> {
  const res: WebInterfaceViewData = await requestWebInterfaceView(id, type, proxy);
  let result: { flvUrl: string; pic: string } | undefined = undefined;
  let flvUrl: string | undefined = undefined; // 视频地址

  if (res?.data?.pages) {
    const { cid }: WebInterfaceViewDataPageItem = res.data.pages[page - 1]; // cid

    for (const query of QUERY_ARRAY) {
      const payload: string = `appkey=${ APP_KEY }&cid=${ cid }&otype=json&page=${ page }&${ query }`;
      const sign: string = md5Crypto(`${ payload }${ BILIBILI_KEY }`);
      const videoInfoRes: VideoInfo = await requestVideoInfo(payload, sign, proxy);

      if (videoInfoRes?.durl?.length) {
        result = {
          flvUrl: videoInfoRes.durl[0].url,
          pic: res.data.pic
        };

        flvUrl = videoInfoRes.durl[0].url;
        break;
      }
    }
  }

  return result;
}

/**
 * 解析视频列表地址
 * @param { string } bvid
 */
export async function parseVideoList(bvid: string): Promise<Array<{ cid: number; part: string }> | void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ bvid }`;
  const html: string = await requestBilibiliHtml(videoUrl, false);
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
 * @param { boolean } proxy: 是否使用代理
 */
export async function parseBangumiVideo(type: string, id: string, proxy: boolean): Promise<string | void> {
  const videoUrl: string = `https://www.bilibili.com/bangumi/play/${ type }${ id }`;
  const html: string = await requestBilibiliHtml(videoUrl, proxy);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  const { aid, cid }: { aid: number; cid: number } = initialState.epInfo;
  const res: BangumiVideoInfo = await requestBangumiVideoInfo(aid, cid, proxy);

  if (res.data) {
    return res.data.durl[0].url;
  } else {
    return undefined;
  }
}

/**
 * 解析音频地址
 * @param { string } id: 音频id
 * @param { boolean } proxy: 是否使用代理
 */
export async function parseAudioUrl(id: string, proxy: boolean): Promise<string | void> {
  const res: AudioInfo = await requestAudioInfo(id, proxy);

  return res.data.cdns?.[0];
}