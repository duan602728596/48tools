import { randomBytes } from 'node:crypto';
import Signer from './Signer';
import { getABResult } from '../../pages/Toutiao/sdk/AB';
import { pcUserAgent2 } from '../utils';

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const basicParams: Record<string, string> = {
  device_platform: 'webapp',
  aid: '6383',
  channel: 'channel_pc_web',
  pc_client_type: '1',
  version_code: '190500',
  update_version_code: '170400',
  version_name: '19.5.0',
  cookie_enabled: 'true',
  screen_width: '1920',
  screen_height: '1080',
  browser_language: 'zh',
  browser_platform: 'Win32',
  browser_name: 'Edge',
  browser_version: '124.0',
  browser_online: 'true',
  engine_name: 'Blink',
  engine_version: '116.0.0.0',
  os_name: 'Windows',
  os_version: '10',
  cpu_core_num: '12',
  device_memory: '8',
  platform: 'PC'
};

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

export async function awemeDetailQueryV2(id: string): Promise<string> {
  const params: Record<string, string> = {
    ...basicParams,
    aweme_id: id,
    msToken: ''
  };
  const urlParam: URLSearchParams = new URLSearchParams(params);
  const a_bogus: string = await getABResult(params, pcUserAgent2);

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