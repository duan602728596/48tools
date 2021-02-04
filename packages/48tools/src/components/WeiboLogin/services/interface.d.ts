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