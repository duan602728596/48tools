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