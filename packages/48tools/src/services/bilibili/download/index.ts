import got, { type Response as GotResponse, Agents as GotAgents } from 'got';
import { HttpProxyAgent, HttpsProxyAgent, type HttpProxyAgentOptions, type HttpsProxyAgentOptions } from 'hpagent';
import { getBilibiliCookie, pcUserAgent, pcUserAgent2 } from '../../../utils/utils';
import { sign } from '../../../utils/bilibili/wbiSign';
import type {
  VideoInfo,
  AudioInfo,
  BangumiVideoInfo,
  SpaceArcSearch,
  WebInterfaceViewData,
  NavInterface,
  PugvSeason,
  PugvSeasonPlayUrl
} from './interface';

export type * from './interface';

function gotAgent(proxy: string | undefined): GotAgents | undefined {
  if (!proxy) return;

  const proxyAgentOptions: HttpProxyAgentOptions | HttpsProxyAgentOptions = {
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    scheduling: 'lifo',
    proxy
  };
  const agent: GotAgents = {
    http: new HttpProxyAgent(proxyAgentOptions),
    https: new HttpsProxyAgent(proxyAgentOptions)
  };

  return agent;
}

// B站api参考：https://github.com/SocialSisterYi/bilibili-API-collect
// 请求bilibili的html
export async function requestBilibiliHtml(url: string, proxy: string | undefined): Promise<string> {
  const res: GotResponse<string> = await got.get(url, {
    responseType: 'text',
    headers: {
      Host: 'www.bilibili.com',
      'User-Agent': pcUserAgent,
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/**
 * 请求视频信息
 */
export async function requestVideoInfo({ type, id, cid, proxy, isDash }: {
  type: string;
  id: string;
  cid: number;
  proxy: string | undefined;
  isDash: boolean;
}): Promise<VideoInfo> {
  const isAV: boolean = type === 'av';
  const searchParams: URLSearchParams = new URLSearchParams({
    [isAV ? 'avid' : 'bvid']: `${ isAV ? '' : 'BV' }${ id }`,
    cid: `${ cid }`,
    ...(isDash ? {
      fnval: '80',
      fnver: '0',
      fourk: '1',
      qn: '0'
    } : {
      fnval: '0',
      fnver: '0',
      fourk: '1',
      qn: '112'
    })
  });
  const apiUrl: string = `https://api.bilibili.com/x/player/playurl?${ searchParams.toString() }`;
  const res: GotResponse<VideoInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/**
 * 请求番剧信息
 * @param { number } aid
 * @param { number } cid
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function requestBangumiVideoInfo(aid: number, cid: number, proxy: string | undefined): Promise<BangumiVideoInfo> {
  const apiUrl: string = `https://api.bilibili.com/x/player/playurl?avid=${ aid }&cid=${ cid }&qn=112`;
  const res: GotResponse<BangumiVideoInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/**
 * 请求音频信息
 * @param { string } auid - 音频id
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function requestAudioInfo(auid: string, proxy: string | undefined): Promise<AudioInfo> {
  const apiUrl: string = `https://www.bilibili.com/audio/music-service-c/web/url?sid=${ auid }&privilege=2&quality=2`;
  const res: GotResponse<AudioInfo> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/**
 * 请求账户的列表
 * @param { string } mid - 账户id
 * @param { number } page - 分页
 */
export async function requestSpaceArcSearch(mid: string, page: number): Promise<SpaceArcSearch> {
  const ps: string = await sign({
    mid,
    pn: String(page),
    ps: '30',
    order: 'pubdate'
  }, undefined);
  const apiUrl: string = `https://api.bilibili.com/x/space/wbi/arc/search?${ ps }`;
  const res: GotResponse<SpaceArcSearch> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Host: 'api.bilibili.com',
      'User-Agent': pcUserAgent2,
      Referer: `https://space.bilibili.com/${ mid }`,
      Cookie: getBilibiliCookie()
    }
  });

  return res.body;
}

/**
 * 根据https://api.bilibili.com/x/web-interface/view?bvid=1V341177FV接口查询视频信息
 * @param { string } id - av或bv的id
 * @param { 'av' | 'bv' } type
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function requestWebInterfaceView(id: string, type: string, proxy: string | undefined): Promise<WebInterfaceViewData> {
  const apiUrl: string = `https://api.bilibili.com/x/web-interface/view?${ type === 'av' ? 'a' : 'bv' }id=${ id }`;
  const res: GotResponse<WebInterfaceViewData> = await got.get(apiUrl, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

export async function requestInterfaceNav(proxy: string | undefined): Promise<NavInterface> {
  const res: GotResponse<NavInterface> = await got.get('https://api.bilibili.com/x/web-interface/nav', {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/* 获取课程基本信息 */
export async function requestPugvSeason(epId: string, proxy: string | undefined): Promise<PugvSeason> {
  const res: GotResponse<PugvSeason> = await got.get(`https://api.bilibili.com/pugv/view/web/season?ep_id=${ epId }`, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/* 获取视频地址 */
export async function requestPugvPlayurl(epId: string, aid: number, cid: number, proxy: string | undefined): Promise<PugvSeasonPlayUrl> {
  const qs: URLSearchParams = new URLSearchParams({
    avid: String(aid),
    cid: String(cid),
    ep_id: epId,
    fnval: '16'
  });

  const res: GotResponse<PugvSeasonPlayUrl> = await got.get(`https://api.bilibili.com/pugv/player/web/playurl?${ qs.toString() }`, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie(),
      Referer: 'https://www.bilibili.com/'
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}