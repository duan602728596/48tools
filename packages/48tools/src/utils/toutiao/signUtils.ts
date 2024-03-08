import { randomBytes } from 'node:crypto';
import Signer from './Signer';

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * msToken的生成
 * @param { number } [length = 128] - 107或者128
 */
export function msToken(length: number = 128): string {
  const bytes: Buffer = randomBytes(length);

  return Array.from(bytes, (byte: number): string => CHARACTERS[byte % CHARACTERS.length]).join('');
}

/* ua必须对应Params */
export function awemePostQueryV2(secUserId: string, maxCursor: number): string {
  const urlParam: URLSearchParams = new URLSearchParams({
    aid: '6383',
    sec_user_id: secUserId,
    max_cursor: `${ maxCursor }`,
    count: '18',
    cookie_enabled: 'true',
    platform: 'PC'
  });
  const xbogus: string = Signer.sign(urlParam.toString(), '');

  urlParam.set('X-Bogus', xbogus);

  return urlParam.toString();
}

export function awemeDetailQueryV2(id: string): string {
  const urlParam: URLSearchParams = new URLSearchParams({
    aid: '6383',
    aweme_id: id,
    cookie_enabled: 'true',
    platform: 'PC'
  });
  const xbogus: string = Signer.sign(urlParam.toString(), '');

  urlParam.set('X-Bogus', xbogus);

  return urlParam.toString();
}

/* 地址处理 */
export function staticUrl(u: string): string {
  if (/^http:?/.test(u)) {
    return u;
  } else if (/^\/\//.test(u)) {
    return `https:${ u }`;
  } else {
    return u;
  }
}