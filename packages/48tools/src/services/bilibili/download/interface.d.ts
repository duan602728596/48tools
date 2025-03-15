/* ========== 加密 ========== */
export interface NavInterface {
  data: {
    wbi_img: {
      img_url: string;
      sub_url: string;
    };
  };
}

/* ========== Download ========== */
export interface DashVideoItem {
  backupUrl: Array<string>;
  backup_url: Array<string>;
  baseUrl: string;
  base_url: string;
  id: number;
  first_frame?: string;
}

export interface DashSupportFormats {
  display_desc: string;
  new_description: string;
  quality: number;
}

export interface DashVideoInfo {
  audio: Array<DashVideoItem>;
  video: Array<DashVideoItem>;
}

export interface DurlVideoInfo {
  backup_url: Array<string>;
  url: string;
}

export interface VideoData {
  accept_description: Array<string>;
  accept_quality: Array<number>;
  durl?: Array<DurlVideoInfo>;
  dash?: DashVideoInfo;
  support_formats: Array<DashSupportFormats>;
}

// 接口请求到的视频信息
export interface VideoInfo {
  code: number;
  message: string;
  data: VideoData;
}

// 接口请求到的音频信息
export interface AudioInfo {
  code: number;
  data: {
    cdns?: Array<string>;
    title: string;
    cover: string;
  };
  msg: string;
}

// 请求的番剧列表
export interface BangumiWebSeasonEpisodesItem {
  aid: number;
  bvid: string;
  cid: number;
  ep_id: number;
  id: number;
  cover: string;
  long_title: string; // 标题
  share_copy: string; // 完整标题
  show_title: string; // 显示标题
}

export interface BangumiWebSeasonResult {
  episodes: Array<BangumiWebSeasonEpisodesItem>;
  title: string;
  cover: string;
}

export interface BangumiWebSeason {
  code: number;
  message: string;
  result: BangumiWebSeasonResult;
}

// 空间信息
export interface SpaceArcSearchVListItem {
  comment: number;
  typeid: number;
  play: number;
  pic: string;
  subtitle: string;
  description: string;
  copyright: string;
  title: string;
  review: number;
  author: string;
  mid: number;
  created: number;
  length: string;
  video_review: number;
  aid: number;
  bvid: string;
  hide_click: boolean;
  is_pay: number;
  is_union_video: number;
  is_steins_gate: number;
  is_live_playback: number;
}

export interface SpaceArcSearch {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: {
      tlist: Record<string, {
        tid: number;
        count: number;
        name: string;
      }>;
      vList: Array<SpaceArcSearchVListItem>;
      vlist: Array<SpaceArcSearchVListItem>;
    };
    page: {
      pn: number;
      ps: number;
      count: number;
    };
  };
}

// 通过接口获取视频信息
export interface WebInterfaceViewDataPageItem {
  cid: number;
  page: number;
  part: string;
}

export interface WebInterfaceViewData {
  code: number;
  message: string;
  ttl: number;
  data: {
    bvid: `BV${ string }`;
    aid: number;
    cid: number;
    pic: string;
    title: string;
    pages: Array<WebInterfaceViewDataPageItem>;
  };
}

// 课程信息
export interface PugvSeasonEpisodesItem {
  aid: number;
  cid: number;
  id: number;
  title: string;
  cover: string;
  status: 1 | 2; // 2：需要付费
}

export interface PugvSeason {
  code: number;
  data: {
    episodes: Array<PugvSeasonEpisodesItem>;
    title: string;
    cover: string;
  };
  message: string;
}

export interface PugvSeasonPlayUrlVideoDataDurl {
  quality: number;
  durl: Array<DurlVideoInfo>;
}

export interface PugvSeasonPlayUrlVideoData extends VideoData {
  durls: Array<PugvSeasonPlayUrlVideoDataDurl>;
}

/**
 * 旧的课程可能出现返回durl的情况
 * 例如：
 * 零基础学会伪厚涂：暗黑病娇风少女篇（全过程详解）- 劣质罐头 就是返回durl
 * - https://www.bilibili.com/cheese/play/ss394?csource=private_space_class_null
 * - https://api.bilibili.com/pugv/view/web/season?ep_id=11984
 * - https://api.bilibili.com/pugv/player/web/playurl?avid=719340517&ep_id=11984&cid=444505720&fnval=16
 * 而 宋浩：专升本高等数学考前串讲冲刺课 就是返回的dash
 * - https://www.bilibili.com/cheese/play/ep205797?csource=private_space_tougao_null
 * - https://api.bilibili.com/pugv/view/web/season?ep_id=205797
 * - https://api.bilibili.com/pugv/player/web/playurl?avid=960526794&ep_id=215167&cid=1255148570&fnval=16
 */
export interface PugvSeasonPlayUrl {
  code: number;
  data: PugvSeasonPlayUrlVideoData;
  message: string;
}