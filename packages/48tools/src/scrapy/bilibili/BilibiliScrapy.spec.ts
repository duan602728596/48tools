import type { WebInterfaceViewData, RequestVideoInfoArgumentObject, VideoInfo, AudioInfo, BangumiWebSeason, PugvSeason, PugvSeasonPlayUrl } from '@48tools-api/bilibili/download';
import type { RoomInfo, RoomPlayUrlV2, RoomPlayUrlV2StreamFormat } from '@48tools-api/bilibili/live';
import * as x$webInterface$view__bvid_BV1og4y187vP from '__mocks__/services/bilibili/download/x$web-interface$view@bvid=BV1og4y187vP.mockdata.json';
import * as x$player$playUrl__bvid_BV1og4y187vP_cid_185864709 from '__mocks__/services/bilibili/download/x$player$playurl@bvid=BV1og4y187vP#cid=185864709.mockdata.json';
import * as audio$musicServiceC$url__songid_590187 from '__mocks__/services/bilibili/download/audio$music-service-c$ur@songid=590187.mockdata.json';
import * as pgc$view$web$season__ep_id_476665 from '__mocks__/services/bilibili/download/pgc$view$web$season@ep_id=476665.mockdata.json';
import * as x$player$playUrl__bvid_BV1BP4y1K7cC_cid_566153909 from '__mocks__/services/bilibili/download/x$player$playurl@bvid=BV1BP4y1K7cC#cid=566153909.mockdata.json';
import * as pugv$view$web$season__ep_id_215167 from '__mocks__/services/bilibili/download/pugv$view$web$season@ep_id=215167.mock.json';
import * as pugv$player$web$playurl__avid_960526794_ep_id_215167_cid_1255148570 from '__mocks__/services/bilibili/download/pugv$player$web$playurl@avid=960526794#ep_id=215167#cid=1255148570.mockdata.json';
import * as room$v1$room$get_info__id_1947277414 from '__mocks__/services/bilibili/live/room$v1$room$get_info@id=1947277414.mockdata.json';
import * as xlive$web_room$v2$index$getRoomPlayInfo__room_id_1947277414 from '__mocks__/services/bilibili/live/xlive$web-room$v2$index$getRoomPlayInfo@room_id=1947277414.mockdata.json';

/**
 * 将json的类型转换，修复某些类型对不上的问题
 * @param { any } x
 */
function JsonTypeTransform<T>(x: any): T {
  return x;
}

jest.mock('@48tools-api/bilibili/live', (): {
  requestRoomInfoData(): Promise<RoomInfo>;
  requestRoomPlayerUrlV2(): Promise<RoomPlayUrlV2>;
} => ({
  requestRoomInfoData: (): Promise<RoomInfo> => Promise.resolve(room$v1$room$get_info__id_1947277414),
  requestRoomPlayerUrlV2: (): Promise<RoomPlayUrlV2> => Promise.resolve(JsonTypeTransform<RoomPlayUrlV2>(xlive$web_room$v2$index$getRoomPlayInfo__room_id_1947277414))
}));
jest.mock('@48tools-api/bilibili/download', (): {
  requestWebInterfaceView(): Promise<WebInterfaceViewData>;
  requestVideoInfo(x: RequestVideoInfoArgumentObject): Promise<VideoInfo>;
  requestAudioInfo(): Promise<AudioInfo>;
  requestBangumiWebSeason(): Promise<BangumiWebSeason>;
  requestPugvSeasonV2(): Promise<PugvSeason>;
  requestPugvPlayurl(): Promise<PugvSeasonPlayUrl>;
} => ({
  requestWebInterfaceView: (): Promise<WebInterfaceViewData> => Promise.resolve(JsonTypeTransform<WebInterfaceViewData>(x$webInterface$view__bvid_BV1og4y187vP)),
  requestVideoInfo({ type, id, cid, proxy, isDash }: RequestVideoInfoArgumentObject): Promise<VideoInfo> {
    if (id === 'BV1BP4y1K7cC') {
      return Promise.resolve(x$player$playUrl__bvid_BV1BP4y1K7cC_cid_566153909);
    }

    return Promise.resolve(x$player$playUrl__bvid_BV1og4y187vP_cid_185864709);
  },
  requestAudioInfo: (): Promise<AudioInfo> => Promise.resolve(audio$musicServiceC$url__songid_590187),
  requestBangumiWebSeason: (): Promise<BangumiWebSeason> => Promise.resolve(pgc$view$web$season__ep_id_476665),
  requestPugvSeasonV2: (): Promise<PugvSeason> => Promise.resolve(JsonTypeTransform<PugvSeason>(pugv$view$web$season__ep_id_215167)),
  requestPugvPlayurl: (): Promise<PugvSeasonPlayUrl> => Promise.resolve(JsonTypeTransform<PugvSeasonPlayUrl>(pugv$player$web$playurl__avid_960526794_ep_id_215167_cid_1255148570))
}));

import { BilibiliScrapy, BilibiliVideoType, type BilibiliVideoResultItem, type FindVideoInfoReturn } from './BilibiliScrapy';
import { describe } from 'node:test';

describe('test BilibiliScrapy class', function(): void {
  /* 视频的测试 */
  describe('test parse video', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const { videoInfoItem }: FindVideoInfoReturn = bilibiliScrapy.findVideoInfo();

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(x$webInterface$view__bvid_BV1og4y187vP.data.title);
      expect(videoResultItem.videoInfo.length).toBeGreaterThan(0);
      expect(videoResultItem.title).toBe(x$webInterface$view__bvid_BV1og4y187vP.data.pages[1].part);
      expect(videoResultItem.cid).toBe(x$player$playUrl__bvid_BV1og4y187vP_cid_185864709.data.last_play_cid);
      expect(videoInfoItem.videoUrl).toBe(x$player$playUrl__bvid_BV1og4y187vP_cid_185864709.data.dash.video[1].base_url);
    }

    test('should parse video when pass type and id', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.BV,
        id: '1og4y187vP',
        page: 2
      });

      await verify(bilibiliScrapy);
    });

    test('should parse video when pass url', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        url: 'https://www.bilibili.com/video/BV1og4y187vP?vd_source=05eaaf104a5dc003c4195bc68a59169b&spm_id_from=333.788.videopod.episodes&p=2'
      });

      await verify(bilibiliScrapy);
    });
  });

  /* 音频的测试 */
  describe('test parse audio', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const { videoInfoItem }: FindVideoInfoReturn = bilibiliScrapy.findVideoInfo();

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(audio$musicServiceC$url__songid_590187.data.title);
      expect(videoResultItem.title).toBe(audio$musicServiceC$url__songid_590187.data.title);
      expect(videoInfoItem).toEqual({
        videoUrl: audio$musicServiceC$url__songid_590187.data.cdns[0],
        quality: 0,
        qualityDescription: '标准'
      });
    }

    test('should parse audio when pass type and id', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.AU,
        id: '590187'
      });

      await verify(bilibiliScrapy);
    });

    test('should parse audio when pass url', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        url: 'https://www.bilibili.com/audio/au590187'
      });

      await verify(bilibiliScrapy);
    });
  });

  /* 番剧的测试 */
  describe('test parse bangumi', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const { videoInfoItem }: FindVideoInfoReturn = bilibiliScrapy.findVideoInfo();

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(pgc$view$web$season__ep_id_476665.result.title);
      expect(videoResultItem.videoInfo.length).toBeGreaterThan(0);
      expect(videoResultItem.title).toBe(pgc$view$web$season__ep_id_476665.result.episodes[1].long_title);
      expect(x$player$playUrl__bvid_BV1BP4y1K7cC_cid_566153909.data.dash.video[1].base_url.includes(String(videoResultItem.cid))).toBeTruthy();
      expect(videoInfoItem.videoUrl).toBe(x$player$playUrl__bvid_BV1BP4y1K7cC_cid_566153909.data.dash.video[2].base_url);
    }

    test('should parse bangumi when pass type and id', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.EP,
        id: '476664'
      });

      await verify(bilibiliScrapy);
    });

    test('should parse bangumi when pass url', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        url: 'https://www.bilibili.com/bangumi/play/ep476664?spm_id_from=333.999.0.0&from_spmid=666.25.episode.0'
      });

      await verify(bilibiliScrapy);
    });
  });

  /* 课程的测试 */
  describe('test parse cheese', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const { videoInfoItem }: FindVideoInfoReturn = bilibiliScrapy.findVideoInfo();

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(pugv$view$web$season__ep_id_215167.data.title);
      expect(videoResultItem.videoInfo.length).toBeGreaterThan(0);
      expect(videoResultItem.title).toBe(pugv$view$web$season__ep_id_215167.data.episodes[1].title);
      expect(videoInfoItem.videoUrl).toBe(pugv$player$web$playurl__avid_960526794_ep_id_215167_cid_1255148570.data.dash.video[2].base_url);
    }

    test('should parse cheese when pass type and id', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.CHEESE_EP,
        id: '215167'
      });

      await verify(bilibiliScrapy);
    });

    test('should parse cheese when pass url', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        url: 'https://www.bilibili.com/cheese/play/ep215167?csource=private_space_tougao_null'
      });

      await verify(bilibiliScrapy);
    });
  });

  /* 直播的测试 */
  describe('test parse live', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();
      await bilibiliScrapy.asyncLoadVideoInfoByPage();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const { videoInfoItem }: FindVideoInfoReturn = bilibiliScrapy.findVideoInfo();
      const { codec }: RoomPlayUrlV2StreamFormat = JsonTypeTransform<RoomPlayUrlV2StreamFormat>(xlive$web_room$v2$index$getRoomPlayInfo__room_id_1947277414.data.playurl_info.playurl.stream[0].format[0]);

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(room$v1$room$get_info__id_1947277414.data.title);
      expect(videoResultItem.videoInfo.length).toBeGreaterThan(0);
      expect(videoResultItem.title).toBe(room$v1$room$get_info__id_1947277414.data.title);
      expect(videoInfoItem.videoUrl).toBe(`${ codec[0].url_info[0].host }${ codec[0].base_url }${ codec[0].url_info[0].extra }`);
    }

    test('should parse live when pass type and id', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        type: BilibiliVideoType.LIVE,
        id: '1947277414'
      });

      await verify(bilibiliScrapy);
    });

    test('should parse live when pass url', async function(): Promise<void> {
      const bilibiliScrapy: BilibiliScrapy = new BilibiliScrapy({
        url: 'https://live.bilibili.com/1947277414?session_id=4e7667a0350bb7544f224bba0667dc11_7F52BD35-6117-4218-AD6D-23E2595DDCED&launch_id=1000216&live_from=71001'
      });

      await verify(bilibiliScrapy);
    });
  });
});