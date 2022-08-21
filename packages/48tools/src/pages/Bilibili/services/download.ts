import got, { type Response as GotResponse, type Agents as GotAgents } from 'got';
import { HttpProxyAgent, HttpsProxyAgent, type HttpProxyAgentOptions, type HttpsProxyAgentOptions } from 'hpagent';
import { getBilibiliCookie, isTest } from '../../../utils/utils';
import type { VideoInfo, AudioInfo, BangumiVideoInfo, SpaceArcSearch, WebInterfaceViewData } from './interface';

const proxyAgentOptions: HttpProxyAgentOptions | HttpsProxyAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
  scheduling: 'lifo',
  proxy: atob('aHR0cDovL2Nocm9tZXR3LnVmdW5yLm1lOjc3Nzc=')
};
const gotAgent: GotAgents = {
  http: new HttpProxyAgent(proxyAgentOptions),
  https: new HttpsProxyAgent(proxyAgentOptions)
};

const proxyAgentOptionsChineseMainland: HttpProxyAgentOptions | HttpsProxyAgentOptions = {
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 256,
  maxFreeSockets: 256,
  scheduling: 'lifo',
  proxy: atob('aHR0cDovL2Nocm9tZS51ZnVuci5tZTo3Nzc3')
};
const gotAgentChineseMainland: GotAgents | undefined = isTest ? {
  http: new HttpProxyAgent(proxyAgentOptionsChineseMainland),
  https: new HttpsProxyAgent(proxyAgentOptionsChineseMainland)
} : undefined;

// B站api参考：https://github.com/SocialSisterYi/bilibili-API-collect
// 请求bilibili的html
export async function requestBilibiliHtml(url: string, proxy: boolean): Promise<string> {
  const res: GotResponse<string> = await got.get(url, {
    responseType: 'text',
    headers: {
      Host: 'www.bilibili.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) '
        + 'Chrome/84.0.4147.38 Safari/537.36 Edg/84.0.522.15',
      Cookie: getBilibiliCookie()
    },
    agent: proxy ? gotAgent : gotAgentChineseMainland
  });

  return res.body;
}

/**
 * 请求视频信息
 * @param { string } payload: 查询参数
 * @param { string } sign: 加密后的sign
 * @param { boolean } proxy: 是否使用代理
 */
export async function requestVideoInfo(payload: string, sign: string, proxy: boolean): Promise<VideoInfo> {
  const apiUrl: string = `https://interface.bilibili.com/v2/playurl?${ payload }&sign=${ sign }`;
  const res: GotResponse<VideoInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: proxy ? gotAgent : gotAgentChineseMainland
  });

  return res.body;
}

/**
 * 请求番剧信息
 * @param { number } aid
 * @param { number } cid
 * @param { boolean } proxy: 是否使用代理
 */
export async function requestBangumiVideoInfo(aid: number, cid: number, proxy: boolean): Promise<BangumiVideoInfo> {
  const apiUrl: string = `https://api.bilibili.com/x/player/playurl?avid=${ aid }&cid=${ cid }&qn=112`;
  const res: GotResponse<BangumiVideoInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: proxy ? gotAgent : gotAgentChineseMainland
  });

  return res.body;
}

/**
 * 请求音频信息
 * @param { string } auid: 音频id
 * @param { boolean } proxy: 是否使用代理
 */
export async function requestAudioInfo(auid: string, proxy: boolean): Promise<AudioInfo> {
  const apiUrl: string = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${ auid }&privilege=2&quality=2`;
  const res: GotResponse<AudioInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: proxy ? gotAgent : gotAgentChineseMainland
  });

  return res.body;
}

/**
 * 请求账户的列表
 * @param { string } mid: 账户id
 * @param { number } page: 分页
 */
export async function requestSpaceArcSearch(mid: string, page: number): Promise<SpaceArcSearch> {
  const searchParams: URLSearchParams = new URLSearchParams({
    mid,
    ps: '30',
    pn: String(page),
    order: 'pubdate'
  });
  const apiUrl: string = `https://api.bilibili.com/x/space/arc/search?${ searchParams.toString() }`;
  const res: Response = await fetch(apiUrl);

  return res.json();
}

/**
 * 根据https://api.bilibili.com/x/web-interface/view?bvid=1V341177FV接口查询视频信息
 * @param { string } id: av或bv的id
 * @param { 'av' | 'bv' } type
 * @param { boolean } proxy: 是否使用代理
 */
export async function requestWebInterfaceView(id: string, type: string, proxy: boolean): Promise<WebInterfaceViewData> {
  const apiUrl: string = `https://api.bilibili.com/x/web-interface/view?${ type === 'av' ? 'a' : 'bv' }id=${ id }`;
  const res: GotResponse<WebInterfaceViewData> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: proxy ? gotAgent : gotAgentChineseMainland
  });

  return res.body;
}