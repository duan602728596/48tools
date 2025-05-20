/* 抖音user的数据结构 */
import { requestLiveReflowInfo } from '@48tools-api/toutiao/douyin/index';

interface AwemeItemRate {
  width: number;
  height: number;
  url_list: Array<string>;
}

export interface BitRateItem {
  play_addr: AwemeItemRate;
  download_addr?: AwemeItemRate;
}

export interface AwemeItem {
  desc: string;
  video: {
    bit_rate: Array<BitRateItem>;
  };
  images: Array<AwemeItemRate>;
  aweme_id: string;
  create_time: number;
  author: {
    nickname: string;
  };
}

export interface AwemePostResponse {
  aweme_list: Array<AwemeItem>;
  max_cursor: number;
  has_more: 1 | 0;
}

/* 抖音detail的数据结构 */
export interface AwemeDetailResponse {
  aweme_detail: AwemeItem;
  status_code: number;
}

/* 返回不同的数据类型 */
export interface DouyinHtmlCookieType {
  type: 'cookie';
  cookie: string;
  html: string;
}

export interface DouyinHtmlType {
  type: 'html';
  html: string;
}

export interface DouyinUserApiType {
  type: 'userApi';
  data: AwemePostResponse | undefined;
}

export interface DouyinDetailApiType {
  type: 'detailApi';
  data: AwemeDetailResponse | undefined;
}

export type DouyinHtmlResponseType = DouyinHtmlCookieType | DouyinHtmlType | DouyinUserApiType | DouyinDetailApiType;

export interface LiveStreamUrl {
  // flv
  flv_pull_url: {
    FULL_HD1: string;
    HD1?: string;
    SD1?: string;
    SD2?: string;
  };
  // m3u8
  hls_pull_url_map: {
    FULL_HD1: string;
    HD1?: string;
    SD1?: string;
    SD2?: string;
  };
  hls_pull_url: string;
}

/* 抖音直播的数据结构 */
export interface LiveEnterData {
  status: 2;
  stream_url?: LiveStreamUrl;
}

export interface LiveEnter {
  data: {
    data: [LiveEnterData] | [];
    room_status: 0 | 2; // 0 开启 2 未直播
    user: {
      sec_uid: string;
    };
  };
  status_code: number;
}

/* 抖音电台 */
export interface LiveReflowInfo {
  data: {
    room: {
      stream_url?: LiveStreamUrl;
    };
  };
  status_code: number;
}