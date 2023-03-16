/* 抖音user的数据结构 */
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