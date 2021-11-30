import * as querystring from 'node:querystring';
import got, { type Response as GotResponse, type CancelableRequest } from 'got';
import type { PcDirectQr, ScanResult, AcceptResult } from './interface';

// 获取A站的二维码
export async function requestPcDirectQr(): Promise<PcDirectQr> {
  const time: number = new Date().getTime();
  const apiUrl: string = `https://scan.acfun.cn/rest/pc-direct/qr/start?type=WEB_LOGIN&_=${ time }`;
  const res: GotResponse<PcDirectQr> = await got.get(apiUrl, {
    responseType: 'json'
  });

  return res.body;
}

/**
 * 阻塞监听是否扫码
 * @param { string } qrLoginToken
 * @param { string } qrLoginSignature
 */
export function requestPcDirectScanResult(qrLoginToken: string, qrLoginSignature: string): CancelableRequest<GotResponse<ScanResult>> {
  const query: string = querystring.stringify({
    qrLoginToken,
    qrLoginSignature,
    _: new Date().getTime()
  });

  return got.get(`https://scan.acfun.cn/rest/pc-direct/qr/scanResult?${ query }`, {
    responseType: 'json'
  });
}

/**
 * 阻塞监听是否登陆并返回cookie
 * @param { string } qrLoginToken
 * @param { string } qrLoginSignature: 是否扫码时返回的qrLoginSignature
 */
export function requestPcDirectAcceptResult(qrLoginToken: string, qrLoginSignature: string): CancelableRequest<GotResponse<AcceptResult>> {
  const query: string = querystring.stringify({
    qrLoginToken,
    qrLoginSignature,
    _: new Date().getTime()
  });

  return got.get(`https://scan.acfun.cn/rest/pc-direct/qr/acceptResult?${ query }`, {
    responseType: 'json'
  });
}