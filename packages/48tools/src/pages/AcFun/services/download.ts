import got, { Response as GotResponse } from 'got';

// 获取acfun的html
export async function requestAcFunHtml(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text'
  });

  return res.body;
}