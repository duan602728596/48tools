import { PartialTest } from './TestId.js';
import { readConfigsCacheFile } from './utils/testUtils.js';

interface VideoWebsiteTestConfig {
  cookie?: string;
}

interface TestConfig {
  partialTest?: false | Array<string>; // 跑部分测试
  bilibili: VideoWebsiteTestConfig & {
    useProxy: boolean;
    proxy: string;
  };
  douyin: VideoWebsiteTestConfig;
  kuaishou: VideoWebsiteTestConfig;
}

export const testConfig: TestConfig = {
  partialTest: [
    PartialTest.IndexName,
    PartialTest.Pocket48Name,
    PartialTest.BilibiliName,
    PartialTest.AcFunName,
    PartialTest.DouyinName,
    PartialTest.WeiboName,
    PartialTest.KuaishouName
  ],
  bilibili: {
    // 如果为true，会跑港澳台的测试用例
    useProxy: true,
    proxy: 'http://127.0.0.1:7897',
    cookie: await readConfigsCacheFile('bilibili-cookie.txt')
  },
  douyin: {
    cookie: await readConfigsCacheFile('douyin-cookie.txt')
  },
  kuaishou: {
    cookie: await readConfigsCacheFile('kuaishou-cookie.txt')
  }
};