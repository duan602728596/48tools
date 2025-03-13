import { match, type Match, type MatchFunction } from 'path-to-regexp';
import { BilibiliVideoType } from './enum';

type BilibiliVideoParam = Partial<{
  classification: string;
  videoId: string
}>;

/* B站视频解析 */
export class BilibiliVideoUrlParser {
  #videoMatch: MatchFunction<BilibiliVideoParam> = match('/:classification/:videoId');
  #playMatch: MatchFunction<BilibiliVideoParam> = match('/:classification/play/:videoId');
  #liveMatch: MatchFunction<BilibiliVideoParam> = match('/:videoId');
  #videoClassificationEnum: Array<string> = ['video', 'audio'];
  #videoTypeEnum: Array<string> = ['av', 'bv', 'au'];
  #playClassificationEnum: Array<string> = ['bangumi', 'cheese'];
  #playTypeEnum: Array<string> = ['ss', 'ep'];

  public rawUrl: string; // 原始地址
  public videoURL: URL;  // 解析地址

  public videoType?: BilibiliVideoType; // 视频类型
  public videoId?: string; // 视频id
  public videoPage?: number;

  /** @param { string } url - 视频地址 */
  constructor(url: string) {
    this.rawUrl = url;
    this.videoURL = new URL(url);
    this.parse();
  }

  /**
   * 提取类型和id
   * @param { string } x - videoId：type + id
   * @return { [string, string] } - 返回[type, id]
   */
  getTypeAndId(x: string): [string, string] {
    return [x.substring(0, 2).toLowerCase(), x.substring(2)];
  }

  // 解析视频地址
  parse(): void {
    if (!/bilibili\.com$/i.test(this.videoURL.hostname)) return; // 非B站地址

    if (/live\.bilibili\.com$/i.test(this.videoURL.hostname)) return this.parseLive();

    // 分页
    const page: string | null = this.videoURL.searchParams.get('p');

    if (page && /^\d+$/.test(page)) this.videoPage = Number(page);

    // 解析视频
    const parseVideoResult: true | undefined = this.parseVideo();

    if (parseVideoResult) return;

    const parsePlayResult: true | undefined = this.parsePlay();

    if (parsePlayResult) return;
  }

  parseVideo(): true | undefined {
    const matchResult: Match<BilibiliVideoParam> = this.#videoMatch(this.videoURL.pathname);

    if (matchResult && matchResult.params.classification && matchResult.params.videoId) {
      const classification: string = matchResult.params.classification.toLowerCase();
      const [type, id]: [string, string] = this.getTypeAndId(matchResult.params.videoId);

      if (this.#videoClassificationEnum.includes(classification) && this.#videoTypeEnum.includes(type)) {
        this.videoType = type === 'av' ? BilibiliVideoType.AV : (type === 'au' ? BilibiliVideoType.AU : BilibiliVideoType.BV);
        this.videoId = id;

        return true;
      }
    }
  }

  parsePlay(): true | undefined {
    const matchResult: Match<BilibiliVideoParam> = this.#playMatch(this.videoURL.pathname);

    if (matchResult && matchResult.params.classification && matchResult.params.videoId) {
      const classification: string = matchResult.params.classification.toLowerCase();
      const [type, id]: [string, string] = this.getTypeAndId(matchResult.params.videoId);

      if (this.#playClassificationEnum.includes(classification) && this.#playTypeEnum.includes(type)) {
        if (classification === 'cheese') {
          this.videoType = type === 'ss' ? BilibiliVideoType.CHEESE_SS : BilibiliVideoType.CHEESE_EP;
        } else {
          this.videoType = type === 'ss' ? BilibiliVideoType.SS : BilibiliVideoType.EP;
        }

        this.videoId = id;

        return true;
      }
    }
  }

  // 直播
  parseLive(): void {
    const matchResult: Match<BilibiliVideoParam> = this.#liveMatch(this.videoURL.pathname);

    if (matchResult && matchResult.params.videoId) {
      this.videoType = BilibiliVideoType.LIVE;
      this.videoId = matchResult.params.videoId;
    }
  }
}