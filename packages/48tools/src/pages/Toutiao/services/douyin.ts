import got, { Response as GotResponse } from 'got';

/**
 * 获取抖音网页的html
 * @param { string } id: 视频id
 */
export async function requestDouyinVideoHtml(id: string): Promise<string> {
  const res: GotResponse<string> = await got.get(`https://www.douyin.com/video/${ id }`, {
    responseType: 'text'
  });

  return res.body;
}