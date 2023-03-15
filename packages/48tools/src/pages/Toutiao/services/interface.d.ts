interface AwemeItemRate {
  width: number;
  height: number;
  url_list: Array<string>;
}

export interface AwemeItem {
  desc: string;
  video: {
    bit_rate: Array<{
      play_addr: AwemeItemRate;
      download_addr?: AwemeItemRate;
    }>;
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

export type DouyinHtmlResponseType = DouyinHtmlCookieType | DouyinHtmlType | DouyinUserApiType;