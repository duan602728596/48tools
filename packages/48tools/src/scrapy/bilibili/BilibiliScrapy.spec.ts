import type { AudioInfo } from '@48tools-api/bilibili/download';
import * as audio$musicServiceC$url from '__mocks__/services/bilibili/audio$music-service-c$url.mockdata.json';

jest.mock('@48tools-api/bilibili/live', (): {} => ({}));
jest.mock('@48tools-api/bilibili/download', (): {
  requestAudioInfo(): Promise<AudioInfo>;
} => ({
  requestAudioInfo: (): Promise<AudioInfo> => Promise.resolve(audio$musicServiceC$url)
}));

import { BilibiliScrapy, BilibiliVideoType, type BilibiliVideoResultItem, type BilibiliVideoInfoItem } from './BilibiliScrapy';

describe('test BilibiliScrapy class', function(): void {
  /* 音频的测试 */
  describe('test parse audio', function(): void {
    // 验证
    async function verify(bilibiliScrapy: BilibiliScrapy): Promise<void> {
      await bilibiliScrapy.parse();

      const videoResultItem: BilibiliVideoResultItem = bilibiliScrapy.findVideoResult();
      const videoInfoItem: BilibiliVideoInfoItem = bilibiliScrapy.findVideoInfo();

      expect(bilibiliScrapy.videoResult.length).toBeGreaterThan(0);
      expect(bilibiliScrapy.title).toBe(audio$musicServiceC$url.data.title);
      expect(videoResultItem.title).toBe(audio$musicServiceC$url.data.title);
      expect(videoInfoItem).toEqual({
        videoUrl: audio$musicServiceC$url.data.cdns[0],
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
});