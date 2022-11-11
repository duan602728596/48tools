// 获取验证码
export interface PcDirectQr {
  expireTime: number;
  imageData: string; // 图片的base64
  next: 'scanResult';
  qrLoginSignature: string;
  qrLoginToken: string;
  result: number;
}

// 扫码时的状态
export interface ScanResult {
  result: number;
  next: 'acceptResult';
  qrLoginSignature: string;
  status: 'SCANNED';
}

// 扫码成功
export interface AcceptResult {
  result: number;
  next: 'succ';
  qrLoginSignature: string;
  acPasstoken: string;
  userId: number;
  ac_username: string;
  ac_userimg: string;
  status: 'ACCEPTED';
}