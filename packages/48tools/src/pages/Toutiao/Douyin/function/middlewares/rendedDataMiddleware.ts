import { DouyinUrlType } from '../parser';
import type {
  ScriptRendedData,
  CVersionObj,
  C0Obj,
  AwemeDetail,
  DownloadUrlItem,
  UserScriptRendedData,
  UserItem1,
  UserItem2,
  UserDataItem,
  GetVideoUrlOnionContext
} from '../../../types';
import type { AwemeItem } from '../../../services/interface';

/* 有api时的渲染 */
function userApiRender(ctx: GetVideoUrlOnionContext): void {
  if (ctx.data) {
    const awemeList: Array<AwemeItem> = (ctx.data.aweme_list ?? []).filter((o: AwemeItem): boolean => ('video' in o));

    if (awemeList.length > 0) {
      ctx.setUserVideoList(awemeList);
      ctx.setVideoQuery({
        secUserId: ctx.parseResult.id,
        maxCursor: ctx.data.max_cursor,
        hasMore: ctx.data.has_more
      });
      ctx.setUserTitle(awemeList[0].author.nickname);
      ctx.setUserModalVisible(true);
    } else {
      ctx.messageApi.warning('该用户没有视频！');
    }
  }

  ctx.setUrlLoading(false);
}

/* 解析RENDER_DATA */
function rendedDataMiddleware(ctx: GetVideoUrlOnionContext, next: Function): void {
  if (ctx.data) {
    userApiRender(ctx);

    return;
  }

  if (!ctx.html) {
    ctx.messageApi.error('找不到相关信息！');
    ctx.setUrlLoading(false);

    return;
  }

  const parseDocument: Document = new DOMParser().parseFromString(ctx.html, 'text/html');
  const rendedData: HTMLElement | null = parseDocument.getElementById('RENDER_DATA');

  if (!rendedData) {
    ctx.messageApi.error('找不到相关信息！');
    ctx.setUrlLoading(false);

    return;
  }

  const data: string = decodeURIComponent(rendedData.innerText);
  const json: ScriptRendedData | UserScriptRendedData = JSON.parse(data);

  if (ctx.parseResult.type === DouyinUrlType.Video) {
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
  } else if (ctx.parseResult.type === DouyinUrlType.User) {
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