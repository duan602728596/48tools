import { PartialTest } from './TestId.js';
import { readConfigsCacheFile } from './utils/testUtils.js';

interface TestConfig {
  partialTest?: false | Array<PartialTest>; // 跑部分测试
  bilibili: {
    useProxy: boolean;
    proxy: string;
    cookie?: string;
  };
  douyin: {
    cookie?: string;
  };
}

export const testConfig: TestConfig = {
  partialTest: [
    PartialTest.IndexName,
    PartialTest.Pocket48Name,
    PartialTest.BilibiliName,
    PartialTest.AcFunName,
    PartialTest.DouyinName,
    PartialTest.WeiboName
  ],
  bilibili: {
    // 如果为true，会跑港澳台的测试用例
    useProxy: true,
    proxy: 'http://127.0.0.1:15732',
    cookie: await readConfigsCacheFile('bilibili-cookie.txt')
  },
  douyin: {
    cookie: await readConfigsCacheFile('douyin-cookie.txt')
  }
};