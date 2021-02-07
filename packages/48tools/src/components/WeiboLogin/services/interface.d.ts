export interface QrcodeImage {
  retcode: number;
  msg: string;
  data: {
    qrid: string;
    image: string;
  };
}

export interface QrcodeCheck {
  retcode: number;
  msg: string;
  data: {
    alt: string;
  };
}

export interface LoginReturn {
  retcode: number;
  uid: string;
  nick: string;
  crossDomainUrlList: Array<string>;
}

export interface UserInfo {
  ok: number;
  data: {
    user: {
      id: number;
      idstr: string;
      screen_name: string;
      name: string;
      location: string;
      description: string;
    };
  };
}