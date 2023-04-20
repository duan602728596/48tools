/* 加载弹幕文件 */
export async function requestDanmuFile(u: string): Promise<string> {
  const res: Response = await fetch(u);

  return res.text();
}