export interface LoginUrl {
  code: number;
  status: boolean;
  ts: number;
  data: {
    url: string;
    oauthKey: string;
  };
}