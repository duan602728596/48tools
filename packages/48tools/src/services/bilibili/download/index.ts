// @ts-expect-error
import got, { type Response as GotResponse, Agents as GotAgents } from 'got';
import { HttpProxyAgent, HttpsProxyAgent, type HttpProxyAgentOptions, type HttpsProxyAgentOptions } from 'hpagent';
import { getBilibiliCookie, pcUserAgent2 } from '../../../utils/utils';
import { sign } from '../../../utils/bilibili/wbiSign';
import type {
  VideoInfo,
  AudioInfo,
  BangumiWebSeason,
  SpaceArcSearch,
  WebInterfaceViewData,
  NavInterface,
  PugvSeason,
  PugvSeasonPlayUrl
} from './interface';

export type * from './interface';

/**
 * 返回代理配置
 * @param { string | undefined } proxy - 代理地址
 * @return { GotAgents | undefined }
 */
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

/**
 * B站api参考：https://github.com/SocialSisterYi/bilibili-API-collect
 */

/**
 * 请求视频信息
 * @param { string } type
 * @param { string } id
 * @param { number } cid
 * @param { string | undefined } proxy
 * @param { boolean } isDash
 */
export async function requestVideoInfo({ type, id, cid, proxy, isDash }: {
  type: string;
  id: string;
  cid: number;
  proxy: string | undefined;
  isDash: boolean;
}): Promise<VideoInfo> {
  const isAV: boolean = type === 'av';
  const idIsBVBeginning: boolean = /^BV/i.test(id);
  const searchParams: URLSearchParams = new URLSearchParams({
    [isAV ? 'avid' : 'bvid']: `${ (isAV || idIsBVBeginning) ? '' : 'BV' }${ id }`,
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
 * 请求番剧列表
 * @param { type } type
 * @param { string } id
 * @param { string | undefined } proxy - 是否使用代理
 */
export async function requestBangumiWebSeason(type: string, id: string, proxy: string | undefined): Promise<BangumiWebSeason> {
  const queryType: string = type === 'ss' ? 'season_id' : 'ep_id';
  const res: GotResponse<BangumiWebSeason> = await got.get(`https://api.bilibili.com/pgc/view/web/season?${ queryType }=${ id }`, {
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
  const apiUrl: string = `https://www.bilibili.com/audio/music-service-c/url?songid=${ auid }&quality=2&privilege=2&mid=0&platform=0`;
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

/* 获取用户的信息 */
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
export async function requestPugvSeasonV2(type: string, epId: string, proxy: string | undefined): Promise<PugvSeason> {
  const queryType: string = type === 'ss' ? 'season_id' : 'ep_id';
  const res: GotResponse<PugvSeason> = await got.get(`https://api.bilibili.com/pugv/view/web/season?${ queryType }=${ epId }`, {
    responseType: 'json',
    headers: {
      Cookie: getBilibiliCookie()
    },
    agent: gotAgent(proxy)
  });

  return res.body;
}

/**
 * 获取课程视频地址
 * @param { string | number } epId - 课程的epid
 * @param { number } aid
 * @param { number } cid
 * @param { string | undefined } proxy
 */
export async function requestPugvPlayurl(epId: string | number, aid: number, cid: number, proxy: string | undefined): Promise<PugvSeasonPlayUrl> {
  const qs: URLSearchParams = new URLSearchParams({
    avid: String(aid),
    cid: String(cid),
    ep_id: String(epId),
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