import {
  requestRoomInfoData,
  requestRoomPlayerUrlV2,
  type RoomInfo,
  type RoomPlayUrlV2
} from '@48tools-api/bilibili/live';
import {
  requestWebInterfaceView,
  requestVideoInfo,
  requestAudioInfo,
  requestBangumiWebSeason,
  requestPugvSeasonV2,
  type WebInterfaceViewData,
  type WebInterfaceViewDataPageItem,
  type VideoInfo,
  type DashVideoItem,
  type DurlVideoInfo,
  type AudioInfo,
  type BangumiWebSeason,
  type BangumiWebSeasonEpisodesItem,
  type PugvSeason,
  type PugvSeasonEpisodesItem,
  type PugvSeasonPlayUrl,
  requestPugvPlayurl
} from '@48tools-api/bilibili/download';
import { BilibiliVideoType, ErrorLevel } from './enum';
import { BilibiliVideoUrlParser } from './BilibiliVideoUrlParser';
import type { ScrapyError, BilibiliVideoResultItem, BilibiliVideoInfoItem } from './interface';

export * from './enum';
export type * from './interface';

interface BilibiliScrapyCoreOptions {
  useProxy?: boolean;
  proxy?: string;
}

interface BilibiliScrapyUrlOptions extends BilibiliScrapyCoreOptions {
  url: string;
}

interface BilibiliScrapyParseOptions extends BilibiliScrapyCoreOptions {
  type: BilibiliVideoType;
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
  error?: ScrapyError;

  #page?: number; // 番剧或者课程的分页

  /**
   * 判断是否是完整url的参数
   * @param { BilibiliScrapyOptions } options
   */
  static isUrlOptions(options: BilibiliScrapyOptions): options is BilibiliScrapyUrlOptions {
    return 'url' in options;
  }

  static isVideoInfo(r: PugvSeasonPlayUrl | VideoInfo): r is VideoInfo {
    return 'durl' in r.data;
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

  // 视频的码率
  static videoQnMap: Map<number, string> = new Map([
    [127, '8K 超高清'],
    [126, '杜比视界'],
    [125, 'HDR 真彩色'],
    [120, '4K 超清'],
    [116, '1080P60 高帧率'],
    [112, '1080P+ 高码率'],
    [80, '1080P 高清'],
    [74, '720P60 高帧率'],
    [64, '720P 高清'],
    [32, '480P 清晰'],
    [16, '360P 流畅'],
    [6, '240P 极速']
  ]);

  static liveVideoQnMap: Map<number, string> = new Map([
    [30000, '杜比'],
    [20000, '4K'],
    [10000, '原画'],
    [400, '蓝光'],
    [250, '超清'],
    [150, '高清'],
    [80, '流畅']
  ]);

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

    return this.options.type;
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
    // 番剧和课程的page由传递的epid决定
    if (this.type && [BilibiliVideoType.EP, BilibiliVideoType.CHEESE_EP].includes(this.type)) {
      return this.#page;
    }

    if (BilibiliScrapy.isUrlOptions(this.options)) {
      return this.videoUrlParseResult?.videoPage;
    }

    return this.options.page;
  }

  set page(value: number) {
    if (this.type && [BilibiliVideoType.EP, BilibiliVideoType.CHEESE_EP].includes(this.type)) {
      this.#page = value;
    }
  }

  // 获取代理
  get proxy(): string | undefined {
    if (this.options.useProxy) {
      return this.options.proxy;
    }
  }

  // 获取取得的最大的qn
  get maxQn(): number {
    return this.type === BilibiliVideoType.LIVE ? 10_000 : 80;
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

    if (this.type === BilibiliVideoType.AU) return await this.parseAudio(this.id);

    if (this.type === BilibiliVideoType.EP || this.type === BilibiliVideoType.SS) return await this.parseBangumi(this.type, this.id);

    if (this.type === BilibiliVideoType.CHEESE_EP || this.type === BilibiliVideoType.CHEESE_SS) return await this.parseCheese(this.type, this.id);

    if (this.type === BilibiliVideoType.LIVE) return await this.parseLive(this.id);
  }

  /**
   * 解析视频
   * @param { BilibiliVideoType } type
   * @param { string } id
   */
  async parseVideo(type: BilibiliVideoType, id: string): Promise<void> {
    const interfaceNavRes: WebInterfaceViewData = await requestWebInterfaceView(id, type, this.proxy);

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
  }

  /**
   * 解析音频
   * @param { string } id
   */
  async parseAudio(id: string): Promise<void> {
    const res: AudioInfo = await requestAudioInfo(id, this.proxy);

    if (!(res.code === 0 && res.data && res.data.cdns?.length)) {
      return this.setError(ErrorLevel.Error, res.msg);
    }

    this.title = res.data.title;
    this.cover = res.data.cover;

    const videoInfo: BilibiliVideoInfoItem = {
      quality: 0,
      qualityDescription: '标准',
      videoUrl: res.data.cdns[0]
    };

    this.videoResult = [{
      title: this.title,
      cover: this.cover,
      aid: 0,
      bvid: '',
      cid: 0,
      page: 1,
      videoInfo: [videoInfo]
    }];
  }

  /**
   * 解析番剧
   * @param { BilibiliVideoType } type
   * @param { string } id
   */
  async parseBangumi(type: BilibiliVideoType, id: string): Promise<void> {
    const res: BangumiWebSeason = await requestBangumiWebSeason(type, id, this.proxy);

    if (!(res.code === 0 && res.result)) return this.setError(ErrorLevel.Error, res.message);

    this.title = res.result.title;
    this.cover = BilibiliScrapy.http2https(res.result.cover);
    this.videoResult = res.result.episodes.map((o: BangumiWebSeasonEpisodesItem, i: number): BilibiliVideoResultItem => {
      if (this.type === BilibiliVideoType.EP && String(o.ep_id) === this.id) {
        this.page = i + 1;
      }

      return {
        title: o.long_title,
        cover: BilibiliScrapy.http2https(o.cover),
        aid: o.aid,
        bvid: o.bvid,
        cid: o.cid,
        page: i + 1,
        videoInfo: []
      };
    });
  }

  /**
   * 解析课程
   * @param { BilibiliVideoType } type
   * @param { string } id
   */
  async parseCheese(type: BilibiliVideoType, id: string): Promise<void> {
    const pugvSeasonRes: PugvSeason = await requestPugvSeasonV2(type === BilibiliVideoType.CHEESE_SS ? 'ss' : 'ep', id, this.proxy);

    if (!(pugvSeasonRes.code === 0 && pugvSeasonRes.data)) return this.setError(ErrorLevel.Error, pugvSeasonRes.message);

    this.title = pugvSeasonRes.data.title;
    this.cover = BilibiliScrapy.http2https(pugvSeasonRes.data.cover);
    this.videoResult = pugvSeasonRes.data.episodes.map((o: PugvSeasonEpisodesItem, i: number): BilibiliVideoResultItem => {
      if (this.type === BilibiliVideoType.CHEESE_EP && String(o.id) === this.id) {
        this.page = i + 1;
      }

      return {
        title: o.title,
        cover: o.cover,
        aid: o.aid,
        bvid: '',
        cid: o.cid,
        page: i + 1,
        videoInfo: [],
        cheeseInfo: {
          epid: o.id,
          canRequest: o.status === 1
        }
      };
    });
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
              quality: codec.current_qn,
              qualityDescription: BilibiliScrapy.liveVideoQnMap.get(codec.current_qn) || ''
            });
          }
        }
      }
    }

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
   * @param { number } [p]
   */
  async asyncLoadVideoInfoByPage(p?: number): Promise<ScrapyError | undefined> {
    const index: number = ((typeof p === 'number') ? p : (this.page ?? 1)) - 1;

    if (index >= this.videoResult.length || this.videoResult[index].videoInfo.length > 0) return;

    const item: BilibiliVideoResultItem = this.videoResult[index];
    let videoInfoRes: PugvSeasonPlayUrl | VideoInfo;

    if (this.type === BilibiliVideoType.CHEESE_SS || this.type === BilibiliVideoType.CHEESE_EP) {
      videoInfoRes = await requestPugvPlayurl(item.cheeseInfo!.epid, item.aid, item.cid, this.proxy);
    } else {
      videoInfoRes = await requestVideoInfo({
        type: '',
        id: item.bvid,
        cid: item.cid,
        proxy: this.proxy,
        isDash: true
      });
    }

    if (!(videoInfoRes.code === 0 && videoInfoRes.data)) {
      return { level: ErrorLevel.Error, message: videoInfoRes.message };
    }

    if (videoInfoRes.data.dash) {
      const audioUrl: string = BilibiliScrapy.getVideoUrl(videoInfoRes.data.dash.audio[0]);
      const videoInfo: Array<BilibiliVideoInfoItem> = [];

      videoInfoRes.data.dash.video.forEach((o: DashVideoItem): void => {
        videoInfo.push({
          quality: o.id,
          qualityDescription: BilibiliScrapy.videoQnMap.get(o.id) || '',
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
          qualityDescription: videoInfoRes.data.accept_description[i],
          videoUrl: o.url
        });
      });
      item.videoInfo = videoInfo;
    }
  }

  /**
   * 搜索对应的page的videoResult
   * @param { number } [p]
   */
  findVideoResult(p?: number): BilibiliVideoResultItem {
    const findIndex: number = ((typeof p === 'number') ? p : (this.page ?? 1)) - 1;

    return this.videoResult[findIndex];
  }

  /**
   * 搜索最符合满足分辨率的视频
   * @param { number } [p]
   */
  findVideoInfo(p?: number): BilibiliVideoInfoItem {
    const item: BilibiliVideoResultItem = this.findVideoResult(p);
    let index: number = item.videoInfo.findIndex((o: BilibiliVideoInfoItem) => o.quality <= this.maxQn);

    if (index < 0) index = 0;

    return item.videoInfo[index];
  }
}