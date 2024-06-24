import { randomBytes } from 'node:crypto';
import { getABResult } from '../../pages/Toutiao/sdk/AB';
import { pcUserAgent2 } from '../utils';

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * X-Bogus加密计算：
 * Signer.sign(params, data = '');
 * urlParam.set('X-Bogus', xbogus);
 *
 * a_bogus加密计算：
 * window.bdms.init._v[2].p[42](0, 1, 6, params, data = '', ua)
 */

/**
 * msToken的生成
 * @param { number } [length = 128] - 107或者128
 */
export function msToken(length: number = 128): string {
  const bytes: Buffer = randomBytes(length);

  return Array.from(bytes, (byte: number): string => CHARACTERS[byte % CHARACTERS.length]).join('');
}

/* ua必须对应Params */
export async function awemePostQueryV2(secUserId: string, maxCursor: number): Promise<string> {
  const urlParam: URLSearchParams = new URLSearchParams({
    aid: '6383',
    sec_user_id: secUserId,
    max_cursor: `${ maxCursor }`,
    count: '18',
    cookie_enabled: 'true',
    platform: 'PC'
  });
  const a_bogus: string = await getABResult(urlParam.toString(), '', pcUserAgent2);

  urlParam.set('a_bogus', a_bogus);

  return urlParam.toString();
}

export async function awemeDetailQueryV2(id: string): Promise<string> {
  const urlParam: URLSearchParams = new URLSearchParams({
    aid: '6383',
    aweme_id: id,
    cookie_enabled: 'true',
    platform: 'PC'
  });
  const a_bogus: string = await getABResult(urlParam.toString(), '', pcUserAgent2);

  urlParam.set('a_bogus', a_bogus);

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