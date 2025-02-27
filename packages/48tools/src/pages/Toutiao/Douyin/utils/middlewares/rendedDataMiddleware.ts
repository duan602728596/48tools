import {
  requestAwemePostReturnType,
  requestAwemeDetailReturnType,
  type AwemeItem,
  type AwemeItemRate,
  type BitRateItem,
  type DouyinUserApiType,
  type DouyinDetailApiType
} from '@48tools-api/toutiao/douyin';
import { DouyinUrlType } from '../parser';
import { douyinCookie } from '../../../../../utils/toutiao/DouyinCookieStore';
import * as toutiaosdk from '../../../sdk/toutiaosdk';
import type { DownloadUrlItem, GetVideoUrlOnionContext } from '../../../types';

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
    const awemeList: Array<BitRateItem> = ctx.data.aweme_detail?.video?.bit_rate ?? [];
    const images: Array<AwemeItemRate> = ctx.data.aweme_detail?.images ?? [];
    const urls: DownloadUrlItem[] = [];

    // 视频
    for (let i: number = 0, u: number = 1; i < awemeList.length; i++) {
      const bitRate: BitRateItem = awemeList[i];

      for (let k: number = 0; k < bitRate.play_addr.url_list.length; k++, u++) {
        const addr: string = bitRate.play_addr.url_list[k];

        urls.push({
          label: `下载地址-${ u }(${ bitRate.play_addr.width }*${ bitRate.play_addr.height })`,
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
async function rendedDataMiddleware(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
  if (ctx.dataType === 'userApi' || ctx.parseResult.type === DouyinUrlType.User) {
    if (ctx.data) return userApiRender(ctx);

    const res: DouyinUserApiType = await requestAwemePostReturnType(douyinCookie.toString(), {
      secUserId: ctx.parseResult.id,
      maxCursor: new Date().getTime(),
      hasMore: 1
    });

    if (res.data) {
      ctx.data = res.data;
      ctx.dataType = res.type;

      return userApiRender(ctx);
    }
  }

  if (ctx.dataType === 'detailApi' || ctx.parseResult.type === DouyinUrlType.Video) {
    if (ctx.data) return detailApiRender(ctx);

    const signature: string = await toutiaosdk.acrawler('sign', ['', douyinCookie.toString()]);
    const res: DouyinDetailApiType = await requestAwemeDetailReturnType(douyinCookie.toString(), ctx.parseResult.id, signature);

    if (res.data) {
      ctx.data = res.data;
      ctx.dataType = res.type;

      return detailApiRender(ctx);
    }
  }

  ctx.messageApi.error('找不到相关信息！');
  ctx.setUrlLoading(false);
}

export default rendedDataMiddleware;