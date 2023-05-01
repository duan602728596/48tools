import { DouyinUrlType } from '../parser';
import { staticUrl } from '../signUtils';
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
  GetVideoUrlOnionContext,
  HtmlBitRateItem,
  ImageInfo,
  NoProtocolUrl
} from '../../../types';
import type { AwemeItem, AwemeItemRate, BitRateItem } from '../../../services/interface';

/* 有api时的渲染 */
function userApiRender(ctx: GetVideoUrlOnionContext): void {
  if (ctx.data && ('aweme_list' in ctx.data)) {
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

function detailApiRender(ctx: GetVideoUrlOnionContext): void {
  if (ctx.data && ('aweme_detail' in ctx.data)) {
    const awemeList: Array<BitRateItem> = ctx.data.aweme_detail.video.bit_rate ?? [];
    const images: Array<AwemeItemRate> = ctx.data.aweme_detail.images ?? [];
    const urls: DownloadUrlItem[] = [];

    // 视频
    for (let i: number = 0; i < awemeList.length; i) {
      const bitRate: BitRateItem = awemeList[i];

      for (let k: number = 0; i < bitRate.play_addr.url_list.length; k) {
        const addr: string = bitRate.play_addr.url_list[k];

        urls.push({
          label: `下载地址-${ i + 1 }(${ bitRate.play_addr.width }*${ bitRate.play_addr.height })`,
          value: addr,
          width: bitRate.play_addr.width,
          height: bitRate.play_addr.height
        });
      }
    }

    // 图片
    for (let i: number = 0; i < images.length; i++) {
      const image: AwemeItemRate = images[i];

      for (let k: number = 0; k < image.url_list.length; k++) {
        const addr: string = image.url_list[k];

        urls.push({
          label: `图片${ i + 1 }-下载地址${ k + 1 }(${ image.width }*${ image.height })`,
          value: addr,
          width: image.width,
          height: image.height,
          isImage: true,
          isFirstImage: k === 0
        });
      }
    }

    ctx.setUrlLoading(false);
    ctx.setDownloadUrl(urls);
    ctx.setTitle(ctx.data.aweme_detail.desc);
    ctx.setVisible(true);
  }
}

/* 解析RENDER_DATA */
function rendedDataMiddleware(ctx: GetVideoUrlOnionContext, next: Function): void {
  if (ctx.dataType === 'userApi' && ctx.data) {
    return userApiRender(ctx);
  }

  if (ctx.dataType === 'detailApi' && ctx.data) {
    return detailApiRender(ctx);
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
      const urls: DownloadUrlItem[] = [];

      if (awemeDetail.video.playApi) {
        urls.push({ label: '无水印', value: staticUrl(awemeDetail.video.playApi) });
      }

      const bitRateList: Array<HtmlBitRateItem> = awemeDetail.video.bitRateList ?? [];
      const images: Array<ImageInfo> = awemeDetail?.images ?? [];

      for (let i: number = 0; i < bitRateList.length; i++) {
        const bitRate: HtmlBitRateItem = bitRateList[i];

        for (let k: number = 0; k < bitRate.playAddr.length; k++) {
          const addr: { src: NoProtocolUrl } = bitRate.playAddr[k];

          urls.push({
            label: `下载地址-${ i + 1 }(${ bitRate.width }*${ bitRate.height })`,
            value: staticUrl(addr.src),
            width: bitRate.width,
            height: bitRate.height
          });
        }
      }

      for (let i: number = 0; i < images.length; i++) {
        const image: ImageInfo = images[i];

        for (let k: number = 0; k < image.urlList.length; k++) {
          const addr: string = image.urlList[k];

          urls.push({
            label: `图片${ i + 1 }-下载地址${ k + 1 }${ image.width }*${ image.height })`,
            value: addr,
            width: image.width,
            height: image.height,
            isImage: true,
            isFirstImage: i === 0
          });
        }
      }

      ctx.setDownloadUrl(urls);
      ctx.setTitle(awemeDetail.desc);
      ctx.setVisible(true);
    } else {
      ctx.messageApi.warning('视频不存在或解析失败！');
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
      ctx.messageApi.warning('用户不存在或解析失败！');
    }
  } else {
    ctx.messageApi.warning('无法解析该地址！');
  }

  ctx.setUrlLoading(false);
}

export default rendedDataMiddleware;