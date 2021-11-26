/* ========== Download ========== */
// 接口请求到的视频信息
export interface VideoInfo {
  durl?: Array<{
    backup_url: string;
    url: string;
  }>;
  format: string;
}

// 接口请求到的音频信息
export interface AudioInfo {
  code: number;
  data: {
    cdns?: Array<string>;
  };
  message: string;
}

// 接口请求到的番剧信息
export interface BangumiVideoInfo {
  code: number;
  messgae: string;
  data: {
    durl: Array<{
      backup_url: string;
      url: string;
    }>;
  } | null; // 非会员时查不到
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

/* ========== Live ========== */
// 直播间信息
export interface RoomInit {
  code: number;
  msg: string;
  message: string;
  data: {
    room_id: number;
    short_id: number;
    uid: number;
    live_status: number;
  };
}

// 直播间地址信息
export interface RoomPlayUrl {
  code: number;
  message: string;
  data: {
    durl: Array<{ url: string }>;
  };
}