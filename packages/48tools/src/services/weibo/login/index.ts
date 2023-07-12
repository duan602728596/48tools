import got, { type Response as GotResponse } from 'got';
import type { UserInfo } from './interface';

export type * from './interface';

/**
 * 获取账号信息
 * @param { string } id: 用户id
 * @param { string } cookie
 */
export async function requestUserInfo(id: string, cookie: string): Promise<UserInfo> {
  const res: GotResponse<UserInfo> = await got.get(`https://weibo.com/ajax/profile/info?uid=${ id }`, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}

/**
 * 获取uid接口
 * @param { string } cookie
 */
export async function requestUid(cookie: string): Promise<string | undefined> {
  const res: GotResponse<string> = await got.get('https://weibo.com', {
    responseType: 'text',
    headers: {
      Cookie: cookie
    }
  });

  const newData: Array<string> | null = res.body.match(/"idstr"\s*:\s*"[0-9]+"/);

  // 新版微博
  if (newData) {
    const json: { idstr: string } = JSON.parse(`{${ newData[0] }}`);

    return json.idstr;
  }

  // 旧版微博
  const oldData: Array<string> | null = res.body.match(/\$CONFIG\['uid'\]='[0-9]+'/i);

  if (oldData) {
    return oldData[0].split(/=/)[1].replace(/[';]/g, '');
  }
}