import {
  requestBilibiliHtml,
  requestVideoInfo,
  requestAudioInfo,
  requestBangumiVideoInfo,
  requestWebInterfaceView,
  type VideoInfo,
  type VideoData,
  type AudioInfo,
  type BangumiVideoInfo,
  type WebInterfaceViewData,
  type WebInterfaceViewDataPageItem
} from '@48tools-api/bilibili/download';
import type { InitialState, EpisodesItem, NextDataMediaInfo, NextData } from '../../types';

interface ParseHtmlResult {
  initialState?: InitialState;
  h1Title: string;
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
    h1Title: parseDocument.querySelector('#viewbox_report .tit')?.innerHTML
      ?? parseDocument.querySelector('.media-title')?.innerHTML
      ?? ''
  };
}

/**
 * 解析nextjs的__NEXT_DATA__
 * @param { string } html
 * @param { 'ss' | 'ep' } type - 类型为ss时，取第一个
 * @param { string } id - ss id或ep id，需要根据这个来查具体信息
 */
function parseHtmlNext(html: string, type: string, id: string): ParseHtmlResult {
  const parseDocument: Document = new DOMParser().parseFromString(html, 'text/html');
  const nextData: HTMLElement | null = parseDocument.getElementById('__NEXT_DATA__');
  let initialState: InitialState | undefined = undefined;

  if (nextData) {
    const scriptStr: string = nextData.innerHTML;
    const nextDataJson: NextData = JSON.parse(scriptStr);
    const mediaInfo: NextDataMediaInfo | undefined = nextDataJson?.props?.pageProps?.dehydratedState?.queries
      ?.[0]?.state?.data?.seasonInfo?.mediaInfo;

    if (mediaInfo) {
      const epInfo: EpisodesItem = type === 'ss'
        ? mediaInfo.episodes[0]
        : (mediaInfo.episodes.find((o: EpisodesItem): boolean => o.id === Number(id)) ?? mediaInfo.episodes[0]);

      initialState = {
        aid: epInfo.aid,
        videoData: {
          aid: epInfo.aid,
          bvid: epInfo.bvid,
          pages: mediaInfo.episodes.map((o: EpisodesItem): { cid: number; part: string } => ({
            cid: o.cid,
            part: o.long_title
          })),
          title: mediaInfo.title
        },
        epInfo: {
          aid: epInfo.aid,
          cid: epInfo.cid
        }
      };
    }
  }

  return {
    initialState,
    h1Title: initialState?.videoData?.title ?? ''
  };
}

interface ParseVideoUrlCoreObjectResult {
  videoInfo: VideoInfo;
  pic: string;
  title: string;
}

/**
 * 解析的通用方法
 * @param { string } type - 视频类型
 * @param { string } id - 视频id
 * @param { number } [page = 1] - 分页
 * @param { string | undefined } proxy - 是否使用代理
 * @param { boolean } isDash
 */
async function parseVideoUrlCore(
  type: string,
  id: string,
  page: number = 1,
  proxy: string | undefined,
  isDash: boolean
): Promise<ParseVideoUrlCoreObjectResult | undefined> {
  const res: WebInterfaceViewData = await requestWebInterfaceView(id, type, proxy);

  if (res?.data?.pages) {
    const { cid }: WebInterfaceViewDataPageItem = res.data.pages[page - 1]; // cid
    const [videoInfoRes, viewRes]: [VideoInfo, WebInterfaceViewData] = await Promise.all([
      requestVideoInfo({ type, id, cid, proxy, isDash }),
      requestWebInterfaceView(id, type, proxy)
    ]);

    return { videoInfo: videoInfoRes, pic: res.data.pic, title: viewRes.data.pages[page - 1].part };
  }
}

export interface ParseVideoUrlV2ObjectResult {
  flvUrl: string;
  pic: string;
  title: string;
}

/**
 * 解析视频url。testID：1rp4y1e745
 * @param { string } type - 视频类型
 * @param { string } id - 视频id
 * @param { number } [page = 1] - 分页
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function parseVideoUrlV2(
  type: string,
  id: string,
  page: number = 1,
  proxy: string | undefined
): Promise<ParseVideoUrlV2ObjectResult | undefined> {
  const videoResult: ParseVideoUrlCoreObjectResult | undefined = await parseVideoUrlCore(
    type, id, page, proxy, false);
  let result: { flvUrl: string; pic: string; title: string } | undefined = undefined;

  if (videoResult?.videoInfo?.data?.durl?.length) {
    result = {
      flvUrl: videoResult.videoInfo.data.durl[0].url,
      pic: videoResult.pic,
      title: videoResult.title
    };
  }

  return result;
}

export interface ParseVideoUrlDASHObjectResult {
  videoData: VideoData;
  pic: string;
  title: string;
}

/**
 * 解析视频url。testID：1rp4y1e745
 * @param { string } type - 视频类型
 * @param { string } id - 视频id
 * @param { number } [page = 1] - 分页
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function parseVideoUrlDASH(
  type: string,
  id: string,
  page: number = 1,
  proxy: string | undefined
): Promise<ParseVideoUrlDASHObjectResult | undefined> {
  const videoResult: ParseVideoUrlCoreObjectResult | undefined = await parseVideoUrlCore(type, id, page, proxy, true);
  let result: { videoData: VideoData; pic: string; title: string } | undefined = undefined;

  if (videoResult?.videoInfo?.data?.dash) {
    result = {
      videoData: videoResult.videoInfo.data,
      pic: videoResult.pic,
      title: videoResult.title
    };
  }

  return result;
}

export interface ParseVideoListArrayItemResult {
  cid: number;
  part: string;
}

/**
 * 解析视频列表地址
 * @param { string } bvid
 */
export async function parseVideoList(bvid: string): Promise<Array<ParseVideoListArrayItemResult> | void> {
  const videoUrl: string = `https://www.bilibili.com/video/${ bvid }`;
  const html: string = await requestBilibiliHtml(videoUrl, undefined);
  const { initialState }: ParseHtmlResult = parseHtml(html);

  if (!initialState) {
    return undefined;
  }

  return initialState.videoData.pages;
}

/**
 * 解析番剧的接口
 * 参考：https://github.com/Henryhaohao/Bilibili_video_download/blob/master/bilibili_video_download_bangumi.py
 * @param { string } type - 番剧类型
 * @param { string } id - 番剧id
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function parseBangumiVideo(type: string, id: string, proxy: string | undefined): Promise<string | void> {
  const videoUrl: string = `https://www.bilibili.com/bangumi/play/${ type }${ id }`;
  const html: string = await requestBilibiliHtml(videoUrl, proxy);
  let parseHtmlResult: ParseHtmlResult = parseHtmlNext(html, type, id);

  console.log(parseHtmlResult);

  if (!parseHtmlResult.initialState) {
    parseHtmlResult = parseHtml(html);
  }

  if (!parseHtmlResult.initialState) {
    return undefined;
  }

  const { aid, cid }: { aid: number; cid: number } = parseHtmlResult.initialState.epInfo;
  const res: BangumiVideoInfo = await requestBangumiVideoInfo(aid, cid, proxy);

  if (res.data) {
    return res.data.durl[0].url;
  } else {
    return undefined;
  }
}

/**
 * 解析音频地址
 * @param { string } id - 音频id
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function parseAudioUrl(id: string, proxy: string | undefined): Promise<string | void> {
  const res: AudioInfo = await requestAudioInfo(id, proxy);

  return res.data.cdns?.[0];
}