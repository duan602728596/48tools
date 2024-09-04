import { test } from '@playwright/test';
import { testConfig } from './testConfig.js';
import { PartialTest } from './TestId.js';
import * as indexTest from './tests/index/index.test.js';
import * as pocket48RecordTest from './tests/48/pocket48Record.test.js';
import * as fortyEightInVideo from './tests/48/48InVideo.test.js';
import * as bilibiliDownload from './tests/bilibili/bilibiliDownload.test.js';
import * as bilibiliLive from './tests/bilibili/bilibiliLive.test.js';
import * as acfunDownload from './tests/acfun/acfunDownload.test.js';
import * as acfunLive from './tests/acfun/acfunLive.test.js';
import * as douyinVideo from './tests/douyin/video.test.js';
import * as douyinUser from './tests/douyin/user.test.js';
import * as douyinLive from './tests/douyin/douyinLive.test.js';
import * as weiboLive from './tests/weibo/weiboLive.test.js';
import * as kuaishou from './tests/kuaishou/kuaishouVideoDownload.test.js';

const testGroupTitle: (n: string) => string = (n: string): string => `${ n } test group`;

test.describe.parallel('48tools e2e test', function(): void {
  const runAllTests: boolean = !testConfig.partialTest;
  const partialTest: Array<PartialTest> = Array.isArray(testConfig.partialTest) ? testConfig.partialTest : [];

  if (runAllTests || partialTest.includes(PartialTest.IndexName)) {
    test.describe(indexTest.title, indexTest.callback);
  }

  if (runAllTests || partialTest.includes(PartialTest.Pocket48Name)) {
    test.describe.serial(testGroupTitle(PartialTest.Pocket48Name), function(): void {
      test.describe(pocket48RecordTest.title, pocket48RecordTest.callback);
      test.describe(fortyEightInVideo.title, fortyEightInVideo.callback);
    });
  }

  if (runAllTests || partialTest.includes(PartialTest.BilibiliName)) {
    test.describe.serial(testGroupTitle(PartialTest.BilibiliName), function(): void {
      test.describe(bilibiliDownload.title, bilibiliDownload.callback);
      test.describe(bilibiliLive.title, bilibiliLive.callback);
    });
  }

  if (runAllTests || partialTest.includes(PartialTest.AcFunName)) {
    test.describe.serial(testGroupTitle(PartialTest.AcFunName), function(): void {
      test.describe(acfunDownload.title, acfunDownload.callback);
      test.describe(acfunLive.title, acfunLive.callback);
    });
  }

  if (runAllTests || partialTest.includes(PartialTest.DouyinName)) {
    test.describe.serial(testGroupTitle(PartialTest.DouyinName), function(): void {
      test.describe(douyinVideo.title, douyinVideo.callback);
      test.describe(douyinUser.title, douyinUser.callback);
      test.describe(douyinLive.title, douyinLive.callback);
    });
  }

  if (runAllTests || partialTest.includes(PartialTest.WeiboName)) {
    test.describe.serial(testGroupTitle(PartialTest.WeiboName), function(): void {
      test.describe(weiboLive.title, weiboLive.callback);
    });
  }

  if (runAllTests || partialTest.includes(PartialTest.KuaishouName)) {
    test.describe.serial(testGroupTitle(PartialTest.KuaishouName), function(): void {
      test.describe(kuaishou.title, kuaishou.callback);
    });
  }
});