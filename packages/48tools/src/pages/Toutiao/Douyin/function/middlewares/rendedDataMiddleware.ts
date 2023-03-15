import { DouyinUrlType } from '../toutiao.enum';
import type { GetVideoUrlOnionContext } from '../../../types';
import type {
  ScriptRendedData,
  CVersionObj,
  C0Obj,
  AwemeDetail,
  DownloadUrlItem,
  UserScriptRendedData,
  UserItem1,
  UserItem2,
  UserDataItem
} from '../../../types';

/* 解析RENDER_DATA */
function rendedDataMiddleware(ctx: GetVideoUrlOnionContext, next: Function): void {
  const parseDocument: Document = new DOMParser().parseFromString(ctx.html!, 'text/html');
  const rendedData: HTMLElement | null = parseDocument.getElementById('RENDER_DATA');

  if (!rendedData) {
    ctx.messageApi.error('找不到视频相关信息！');
    ctx.setUrlLoading(false);

    return;
  }

  const data: string = decodeURIComponent(rendedData.innerText);
  const json: ScriptRendedData | UserScriptRendedData = JSON.parse(data);

  if (ctx.type === DouyinUrlType.Video) {
    // 处理视频
    const cVersion: CVersionObj | undefined = Object.values(json).find(
      (o: C0Obj | CVersionObj): o is CVersionObj => typeof o === 'object' && ('aweme' in o));

    if (!cVersion) {
      ctx.messageApi.error('视频相关信息解析失败！');
      ctx.setUrlLoading(false);

      return;
    }

    const awemeDetail: AwemeDetail | undefined = cVersion?.aweme?.detail;

    if (awemeDetail) {
      const urls: DownloadUrlItem[] = [{ label: '无水印', value: `https:${ awemeDetail.video.playApi }` }];
      let i: number = 1;

      for (const bitRate of awemeDetail.video.bitRateList) {
        for (const addr of bitRate.playAddr) {
          urls.push({
            label: `下载地址-${ i++ }(${ bitRate.width }*${ bitRate.height })`,
            value: `https:${ addr.src }`,
            width: bitRate.width,
            height: bitRate.height
          });
        }
      }

      ctx.setDownloadUrl(urls);
      ctx.setTitle(awemeDetail.desc);
      ctx.setVisible(true);
    } else {
      ctx.messageApi.warning('视频不存在！');
    }
  } else if (ctx.type === DouyinUrlType.User) {
    // 处理用户
    const userItemArray: Array<UserItem1 | UserItem2 | string> = Object.values(json);
    const userItem1: UserItem1 | undefined = userItemArray.find(
      (o: UserItem1 | UserItem2 | string): o is UserItem1 => typeof o === 'object' && ('odin' in o));
    const userItem2: UserItem2 | undefined = userItemArray.find(
      (o: UserItem1 | UserItem2 | string): o is UserItem2 => typeof o === 'object' && ('post' in o));

    if (!(userItem1 && userItem2)) {
      ctx.messageApi.error('用户视频列表相关信息解析失败！');
      ctx.setUrlLoading(false);

      return;
    }

    const userData: Array<UserDataItem> | undefined = userItem2?.post?.data;

    if (userData) {
      ctx.setUserVideoList(userItem2.post.data);
      ctx.setVideoQuery({
        secUserId: userItem2.uid,
        maxCursor: userItem2.post.maxCursor,
        webId: userItem1.odin.user_unique_id,
        hasMore: userItem2.post.hasMore
      });
      ctx.setUserTitle(userItem2.user.user.nickname);
      ctx.setUserModalVisible(true);
    } else {
      ctx.messageApi.warning('用户不存在！');
    }
  } else {
    ctx.messageApi.warning('无法解析该地址！');
  }

  ctx.setUrlLoading(false);
}

export default rendedDataMiddleware;