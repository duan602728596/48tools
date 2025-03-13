import { BilibiliVideoUrlParser } from './BilibiliVideoUrlParser';
import { BilibiliVideoType } from './enum';

describe('test BilibiliVideoUrlParser class', function(): void {
  test('should parse bilibili video url - 1', function(): void {
    const url: string = 'https://www.bilibili.com/video/BV1kafaY7Euo/';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.BV);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('1kafaY7Euo');
  });

  test('should parse bilibili video url - 2', function(): void {
    const url: string = 'https://www.bilibili.com/video/av170001/';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.AV);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('170001');
  });

  test('should parse bilibili audio url', function(): void {
    const url: string = 'https://www.bilibili.com/audio/au590187';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.AU);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('590187');
  });

  test('should parse bilibili bangumi url - 1', function(): void {
    const url: string = 'https://www.bilibili.com/bangumi/play/ss43158';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.SS);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('43158');
  });

  test('should parse bilibili bangumi url - 2', function(): void {
    const url: string = 'https://www.bilibili.com/bangumi/play/ep374668';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.EP);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('374668');
  });

  test('should parse bilibili bangumi url - 1', function(): void {
    const url: string = 'https://www.bilibili.com/cheese/play/ss394';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.CHEESE_SS);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('394');
  });

  test('should parse bilibili bangumi url - 2', function(): void {
    const url: string = 'https://www.bilibili.com/cheese/play/ep11984';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.CHEESE_EP);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('11984');
  });

  test('should parse bilibili live url', function(): void {
    const url: string = 'https://live.bilibili.com/1947277414';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(BilibiliVideoType.LIVE);
    expect(bilibiliVideoUrlParseResult.videoId).toBe('1947277414');
  });

  test('should not parse other url', function(): void {
    const url: string = 'https://github.com/duan602728596';
    const bilibiliVideoUrlParseResult: BilibiliVideoUrlParser = new BilibiliVideoUrlParser(url);

    expect(bilibiliVideoUrlParseResult.videoType).toBe(undefined);
    expect(bilibiliVideoUrlParseResult.videoId).toBe(undefined);
  });
});