export interface LoginUrl {
  code: number;
  message: string;
  data: {
    url: string;
    qrcode_key: string;
  };
}

export interface LoginInfo {
  code: number;
  message: string;
  data: {
    code: 86101 | 86038 | 0; // 86101: 未扫码，86038：失效
    message: string;
  };
}