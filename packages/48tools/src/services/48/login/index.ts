import got, { type Response as GotResponse } from 'got';
import { createHeaders } from '../../../utils/snh48';
import type { SMSResult, LoginUserInfo, IMUserInfo, UserInfoReloadOrSwitch, UserMoney } from './interface';

export type * from './interface';

interface RequestSMSArguments {
  mobile: string;
  area?: string;
  answer?: string;
}

/**
 * 发送验证码
 * @param { string } mobile - 手机号
 * @param { string } area - 区号
 * @param { string } answer - 国外手机号可能会有的验证
 */
export async function requestSMS({ mobile, area = '86', answer }: RequestSMSArguments): Promise<SMSResult> {
  const object: Record<string, string> = { mobile, area };

  if (answer) object.answer = answer;

  const res: GotResponse<SMSResult> = await got('https://pocketapi.48.cn/user/api/v1/sms/send2', {
    method: 'POST',
    headers: createHeaders(),
    responseType: 'json',
    json: object
  });

  return res.body;
}

/**
 * 验证码登录
 * @param { string } mobile - 手机号
 * @param { string } code - 短信验证码
 */
export async function requestMobileCodeLogin(mobile: string, code: string): Promise<LoginUserInfo> {
  const res: GotResponse<LoginUserInfo> = await got('https://pocketapi.48.cn/user/api/v1/login/app/mobile/code', {
    method: 'POST',
    headers: createHeaders(undefined, true),
    responseType: 'json',
    json: { mobile, code }
  });

  return res.body;
}

/**
 * 获取im信息
 * @param { string } token
 */
export async function requestImUserInfo(token: string): Promise<IMUserInfo> {
  const res: GotResponse<IMUserInfo> = await got.post('https://pocketapi.48.cn/im/api/v1/im/userinfo', {
    responseType: 'json',
    headers: createHeaders(token),
    json: {}
  });

  return res.body;
}

/* reload user info */
export async function requestUserInfoReload(token: string): Promise<UserInfoReloadOrSwitch> {
  const res: GotResponse<UserInfoReloadOrSwitch> = await got.post('https://pocketapi.48.cn/user/api/v1/user/info/reload', {
    responseType: 'json',
    headers: createHeaders(token),
    json: { from: 'appstart' }
  });

  return res.body;
}

/* switch */
export async function requestUserInfoSwitch(token: string, userId: number): Promise<UserInfoReloadOrSwitch> {
  const res: GotResponse<UserInfoReloadOrSwitch> = await got.post('https://pocketapi.48.cn/user/api/v1/bigsmall/switch/user', {
    responseType: 'json',
    headers: createHeaders(token),
    json: { toUserId: userId }
  });

  return res.body;
}

/* user money */
export async function requestUserMoney(token: string): Promise<UserMoney> {
  console.log(globalThis.__x6c2adf8__);

  const res: GotResponse<UserMoney> = await got.post('https://pocketapi.48.cn/user/api/v1/user/money', {
    responseType: 'json',
    headers: createHeaders(token),
    json: { token }
  });

  return res.body;
}