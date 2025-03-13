import type { DefaultOptionType } from 'rc-select/es/Select';
import {
  requestRoomInfoData,
  requestRoomPlayerUrlV2,
  type RoomInfo,
  type RoomPlayUrlV2,
  type RoomPlayUrlV2QnDesc
} from '@48tools-api/bilibili/live';
import {
  requestWebInterfaceView,
  requestVideoInfo,
  type WebInterfaceViewData,
  type WebInterfaceViewDataPageItem,
  type VideoInfo,
  type DashSupportFormats,
  type DashVideoItem,
  type DurlVideoInfo
} from '@48tools-api/bilibili/download';
import { BilibiliVideoType, ErrorLevel } from './enum';
import { BilibiliVideoUrlParser } from './BilibiliVideoUrlParser';
import type { BilibiliVideoResultItem, BilibiliVideoInfoItem } from './interface';

export * from './enum';

interface BilibiliScrapyCoreOptions {
  useProxy?: boolean;
  proxy?: string;
}

interface BilibiliScrapyUrlOptions extends BilibiliScrapyCoreOptions {
  url: string;
}

interface BilibiliScrapyParseOptions extends BilibiliScrapyCoreOptions {
  type: string;
  id: string;
  page?: number;
}

type BilibiliScrapyOptions = BilibiliScrapyUrlOptions | BilibiliScrapyParseOptions;

/* B站爬虫 */
export class BilibiliScrapy {
  public options: BilibiliScrapyOptions;
  public videoUrlParseResult?: BilibiliVideoUrlParser;

  // 解析结果
  title: string; // 视频标题
  cover: string; // 视频主封面
  videoResult: Array<BilibiliVideoResultItem>; // 视频列表
  qnList: Array<DefaultOptionType>; // 分辨率选择
  error?: {
    level: ErrorLevel;
    message: string;
  };

  /**
   * 判断是否是完整url的参数
   * @param { BilibiliScrapyOptions } options
   */
  static isUrlOptions(options: BilibiliScrapyOptions): options is BilibiliScrapyUrlOptions {
    return 'url' in options;
  }

  /**
   * http转https
   * @param { string } u
   */
  static http2https(u: string): string {
    return u.replace(/^ht{2}p:\/{2}/, 'https://');
  }

  /**
   * 获取视频地址
   * @param { DashVideoItem } dashVideoItem
   */
  static getVideoUrl(dashVideoItem: DashVideoItem): string {
    return dashVideoItem.base_url
      ?? dashVideoItem.baseUrl?.[0]
      ?? dashVideoItem.backup_url
      ?? dashVideoItem.backupUrl?.[0];
  }

  /** @param options */
  constructor(options: BilibiliScrapyOptions) {
    this.options = options;

    if (BilibiliScrapy.isUrlOptions(options)) {
      this.videoUrlParseResult = new BilibiliVideoUrlParser(options.url);
    }
  }

  // 视频类型
  get type(): BilibiliVideoType | undefined {
    if (BilibiliScrapy.isUrlOptions(this.options)) {
      return this.videoUrlParseResult?.videoType;
    }

    if (this.options.type === 'pugv_ep') {
      return BilibiliVideoType.CHEESE_EP;
    }

    return this.options.type as BilibiliVideoType;
  }

  // 视频id
  get id(): string | undefined {
    if (BilibiliScrapy.isUrlOptions(this.options)) {
      return this.videoUrlParseResult?.videoId;
    }

    return this.options.id;
  }

  // 视频分页
  get page(): number | undefined {
    if (BilibiliScrapy.isUrlOptions(this.options)) {
      return this.videoUrlParseResult?.videoPage;
    }

    return this.options.page;
  }

  // 获取代理
  get proxy(): string | undefined {
    if (this.options.useProxy) {
      return this.options.proxy;
    }
  }

  /**
   * 设置错误信息
   * @param { ErrorLevel } level
   * @param { string } message
   */
  setError(level: ErrorLevel, message: string): void {
    this.error = { level, message };
  }

  // 解析
  async parse(): Promise<void> {
    if (!(this.type && this.id)) return this.setError(ErrorLevel.Error, 'B站视频信息解析错误');

    if (this.type === BilibiliVideoType.AV || this.type === BilibiliVideoType.BV) return await this.parseVideo(this.type, this.id);

    if (this.type === BilibiliVideoType.LIVE) return await this.parseLive(this.id);
  }

  /**
   * 解析视频
   * @param { BilibiliVideoType } type
   * @param { string } id
   */
  async parseVideo(type: BilibiliVideoType, id: string): Promise<void> {
    const webInterfaceViewType: string = String(type);
    const interfaceNavRes: WebInterfaceViewData = await requestWebInterfaceView(id, webInterfaceViewType, this.proxy);

    if (interfaceNavRes.code !== 0 || !interfaceNavRes.data) return this.setError(ErrorLevel.Error, interfaceNavRes.message);

    this.title = interfaceNavRes.data.title;
    this.cover = BilibiliScrapy.http2https(interfaceNavRes.data.pic);
    this.videoResult = interfaceNavRes.data.pages.map((o: WebInterfaceViewDataPageItem): BilibiliVideoResultItem => ({
      title: o.part,
      cover: this.cover,
      aid: interfaceNavRes.data.aid,
      bvid: interfaceNavRes.data.bvid,
      cid: o.cid,
      page: o.page,
      videoInfo: []
    }));

    // 获取画质
    const videoInfoRes: VideoInfo = await requestVideoInfo({
      type: 'bv',
      id: this.videoResult[0].bvid,
      cid: this.videoResult[0].cid,
      proxy: this.proxy,
      isDash: true
    });

    if (videoInfoRes.code !== 0 || !videoInfoRes.data) return this.setError(ErrorLevel.Error, interfaceNavRes.message);

    if (videoInfoRes.data.dash) {
      this.qnList = videoInfoRes.data.support_formats.map((o: DashSupportFormats): DefaultOptionType => ({ value: o.quality, label: o.new_description }));

      const audioUrl: string = BilibiliScrapy.getVideoUrl(videoInfoRes.data.dash.audio[0]);
      const videoInfo: Array<BilibiliVideoInfoItem> = [];

      videoInfoRes.data.dash.video.forEach((o: DashVideoItem): void => {
        videoInfo.push({
          quality: o.id,
          videoUrl: BilibiliScrapy.getVideoUrl(o),
          audioUrl
        });
      });
      this.videoResult[0].videoInfo = videoInfo;
    } else if (videoInfoRes.data.durl) {
      const videoInfo: Array<BilibiliVideoInfoItem> = [];

      this.qnList = [];
      videoInfoRes.data.durl.forEach((o: DurlVideoInfo, i: number): void => {
        videoInfo.push({
          quality: videoInfoRes.data.accept_quality[i],
          videoUrl: o.url
        });
        this.qnList.push({
          value: videoInfoRes.data.accept_quality[i],
          label: videoInfoRes.data.accept_description[i]
        });
      });
      this.videoResult[0].videoInfo = videoInfo;
    }
  }

  /**
   * 解析直播
   * @param { string } id
   */
  async parseLive(id: string): Promise<void> {
    const roomInfoRes: RoomInfo = await requestRoomInfoData(id);

    if (roomInfoRes.code !== 0 || !roomInfoRes.data) return this.setError(ErrorLevel.Error, roomInfoRes.message);

    if (roomInfoRes.data.live_status !== 1) return this.setError(ErrorLevel.Warning, '当前直播未开始');

    const roomPlayUrlRes: RoomPlayUrlV2 = await requestRoomPlayerUrlV2(id);

    if (roomPlayUrlRes.code !== 0 || !roomPlayUrlRes.data) return this.setError(ErrorLevel.Error, roomPlayUrlRes.message);

    if (roomPlayUrlRes.data.live_status !== 1) return this.setError(ErrorLevel.Warning, '当前直播未开始');

    this.title = roomInfoRes.data.title;
    this.cover = roomInfoRes.data.user_cover;

    // 视频列表
    const videoInfo: Array<BilibiliVideoInfoItem> = [];

    for (const stream of roomPlayUrlRes.data.playurl_info.playurl.stream) {
      for (const format of stream.format) {
        for (const codec of format.codec) {
          for (const urlInfo of codec.url_info) {
            videoInfo.push({
              videoUrl: `${ urlInfo.host }${ codec.base_url }${ urlInfo.extra }`,
              quality: codec.current_qn
            });
          }
        }
      }
    }

    // 画质列表
    this.qnList = roomPlayUrlRes.data.playurl_info.playurl.g_qn_desc.map((o: RoomPlayUrlV2QnDesc): DefaultOptionType => ({ value: o.qn, label: o.desc }));
    this.videoResult = [{
      title: this.title,
      cover: this.cover,
      aid: 0,
      bvid: '',
      cid: 0,
      page: 1,
      videoInfo
    }];
  }

  /**
   * 根据分页获取视频详细信息
   * @param p
   */
  async getVideoInfoByPage(p?: number): Promise<void> {
    const index: number = ((typeof p === 'number') ? p : (this.page ?? 1)) - 1;

    if (index >= this.videoResult.length || this.videoResult[index].videoInfo.length > 0) return;

    const item: BilibiliVideoResultItem = this.videoResult[index];
    const videoInfoRes: VideoInfo = await requestVideoInfo({
      type: '',
      id: item.bvid,
      cid: item.cid,
      proxy: this.proxy,
      isDash: true
    });

    if (videoInfoRes.data.dash) {
      const audioUrl: string = BilibiliScrapy.getVideoUrl(videoInfoRes.data.dash.audio[0]);
      const videoInfo: Array<BilibiliVideoInfoItem> = [];

      videoInfoRes.data.dash.video.forEach((o: DashVideoItem): void => {
        videoInfo.push({
          quality: o.id,
          videoUrl: BilibiliScrapy.getVideoUrl(o),
          audioUrl
        });
      });
      item.videoInfo = videoInfo;
    } else if (videoInfoRes.data.durl) {
      const videoInfo: Array<BilibiliVideoInfoItem> = [];

      videoInfoRes.data.durl.forEach((o: DurlVideoInfo, i: number): void => {
        videoInfo.push({
          quality: videoInfoRes.data.accept_quality[i],
          videoUrl: o.url
        });
      });
      item.videoInfo = videoInfo;
    }
  }
}