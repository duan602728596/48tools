import got, { type Response as GotResponse } from 'got';
import { getAcFuncCookie } from '../../../utils/utils';

// 获取acfun的html
export async function requestAcFunHtml(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Cookie: getAcFuncCookie()
    }
  });

  return res.body;
}