import { requestFetchHtml, requestLiveOne } from '../services/live48';
import type { InVideoQuery, InVideoItem } from '../types';
import type { LiveOne } from '../services/interface';

export const LIVE_TYPE: Array<string> = ['snh48', 'bej48', 'gnz48', 'shy48', 'ckg48'];

/**
 * 解析网站直播地址
 * @param { string } type: 团体
 */
export async function parseInLive(type: string): Promise<Array<{ label: string; value: string }>> {
  const indexUrl: string = `https://live.48.cn/Index/main/club/${ LIVE_TYPE.indexOf(type) + 1 }`;
  const html: string = await requestFetchHtml(indexUrl);
  const document: Document = new DOMParser().parseFromString(html, 'text/html');
  const watchcontent: NodeListOf<HTMLDivElement> = document.querySelectorAll<HTMLDivElement>('.watchcontent');
  const result: Array<{ label: string; value: string }> = [];

  for (const item of watchcontent) {
    const vText: HTMLDivElement = item.querySelector<HTMLDivElement>('.v-text')!;
    const title: string = vText.querySelector('h2')!.innerHTML;
    const sid: string = vText.querySelector('a')!.getAttribute('sid')!;

    result.push({ label: title, value: sid });
  }

  return result;
}

/**
 * 获取直播地址
 * @param { string } id: 直播id
 * @param { string } quality: 直播画质
 */
export async function parseLiveUrl(id: string, quality: string): Promise<{ url: string; title: string } | null> {
  const html: string = await requestFetchHtml(`https://live.48.cn/Index/inlive/id/${ id }`);
  const document: Document = new DOMParser().parseFromString(html, 'text/html');
  const urlInput: HTMLElement | null = document.getElementById(`${ quality }_url`);

  // 没有直播
  if (!urlInput) {
    return null;
  }

  const video_id: string = (document.getElementById('video_id')
    ?? document.getElementById('vedio_id'))!.getAttribute('value')!;
  const res: LiveOne = await requestLiveOne(video_id);

  if (quality === 'liuchang') {
    return { url: res.content.playStreams[0].streamPath!, title: res.content.title };
  } else {
    return { url: res.content.playStreams[1].streamPath!, title: res.content.title };
  }
}

/**
 * 解析网站录播列表
 * @param { InVideoQuery } inVideoQuery: 查询条件
 * @param { number } page: 分页
 */
export async function parseInVideoUrl(inVideoQuery: InVideoQuery | undefined, page?: number): Promise<{
  data: Array<InVideoItem>;
  total: number;
}> {
  const liveType: number = inVideoQuery?.liveType ? LIVE_TYPE.indexOf(inVideoQuery.liveType) : 0,
    current: number = page ?? inVideoQuery?.page ?? 1;
  const pageUrl: string = `https://live.48.cn/Index/main/club/${ liveType + 1 }/p/${ current }.html`; // 网站地址
  const html: string = await requestFetchHtml(pageUrl);
  const document: Document = new DOMParser().parseFromString(html, 'text/html');

  // 获取当前数据总数
  const totalStr: string | null = document.querySelector('.p-skip')!.innerHTML;
  const total: number = Number(totalStr ? totalStr.match(/[0-9]+/g)?.[0] ?? '0' : '0') * 15;

  // 获取数据列表
  const videos: NodeListOf<HTMLLIElement> = document.querySelectorAll('.videolist .videos');
  const data: Array<InVideoItem> = [];

  for (const video of videos) {
    const href: string = video.querySelector('a')!.getAttribute('href')!;
    const idArr: string[] = href.split(/\//);
    const id: string = idArr[idArr.length - 1];

    data.push({
      title: video.querySelector('h4')!.innerHTML,
      description: video.querySelector('p')!.innerHTML,
      id,
      liveType: inVideoQuery?.liveType ?? 'snh48'
    });
  }

  return { total, data };
}

/**
 * 解析视频地址
 * @param { InVideoItem } record: 视频详情
 * @param { string } quality: 视频品质
 */
export async function parseVideoItem(record: InVideoItem, quality: string): Promise<{ url: string; title: string } | null> {
  const liveType: number = LIVE_TYPE.indexOf(record.liveType);
  const pageUrl: string = `https://live.48.cn/Index/invideo/club/${ liveType + 1 }/id/${ record.id }`; // 网站地址
  const html: string = await requestFetchHtml(pageUrl);
  const document: Document = new DOMParser().parseFromString(html, 'text/html');
  const video_id: string = (document.getElementById('video_id')
    ?? document.getElementById('vedio_id'))!.getAttribute('value')!;
  const res: LiveOne = await requestLiveOne(video_id);

  if (quality === 'liuchang') {
    return { url: res.content.playStreams[0].streamPath!, title: res.content.title };
  } else {
    return { url: res.content.playStreams[1].streamPath!, title: res.content.title };
  }
}