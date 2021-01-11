export interface LoginUrl {
  code: number;
  status: boolean;
  ts: number;
  data: {
    url: string;
    oauthKey: string;
  };
}

export interface LoginInfo {
  status: boolean;
  data: 0 | -4 | -2 | -5; // -4 监听中 -2 过期
  message: string;
}