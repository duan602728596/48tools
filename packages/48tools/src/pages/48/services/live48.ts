/**
 * 抓取网页地址
 * TODO: 48的网页会卡下次抓取，所以使用fetch来抓取
 * @param { string } uri: 网页地址
 */
export async function requestFetchHtml(uri: string): Promise<string> {
  const res: Response = await fetch(uri);

  return await res.text();
}