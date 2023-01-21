import type { GetVideoUrlOnionContext } from '../../../types';
import type { ScriptRendedData, CVersionObj, C0Obj, AwemeDetail, DownloadUrlItem } from '../../../types';

/* 解析RENDER_DATA */
function rendedDataMiddleware(ctx: GetVideoUrlOnionContext, next: Function): void {
  const parseDocument: Document = new DOMParser().parseFromString(ctx.html!, 'text/html');
  const rendedData: HTMLElement | null = parseDocument.getElementById('RENDER_DATA');

  if (!rendedData) {
    ctx.messageApi.error('找不到视频相关信息！');

    return;
  }

  const data: string = decodeURIComponent(rendedData.innerText);
  const json: ScriptRendedData = JSON.parse(data);

  // 处理视频
  if (ctx.type === 'video') {
    const cVersion: CVersionObj | undefined = Object.values(json).find(
      (o: C0Obj | CVersionObj): o is CVersionObj => typeof o === 'object' && ('aweme' in o));

    if (!cVersion) {
      ctx.messageApi.error('视频相关信息解析失败！');

      return;
    }

    const awemeDetail: AwemeDetail = cVersion.aweme.detail;
    const urls: DownloadUrlItem[] = [];

    urls.push({ label: '无水印', value: `https:${ awemeDetail.video.playApi }` });

    let i: number = 1;

    for (const bitRate of awemeDetail.video.bitRateList) {
      for (const addr of bitRate.playAddr) {
        urls.push({
          label: '下载地址-' + i++,
          value: `https:${ addr.src }`
        });
      }
    }

    ctx.setDownloadUrl(urls);
    ctx.setTitle(awemeDetail.desc);
    ctx.setVisible(true);
    ctx.setUrlLoading(false);
  }

  // 处理用户
  if (ctx.type === 'user') {
  }
}

export default rendedDataMiddleware;