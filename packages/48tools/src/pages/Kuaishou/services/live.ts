/**
 * 请求快手直播的网站，并返回html
 * @param { string } id: 直播间的ID
 */
export async function requestLiveHtml(id: string): Promise<string> {
  const res: Response = await fetch(`https://live.kuaishou.com/u/${ id }`);

  return res.text();
}