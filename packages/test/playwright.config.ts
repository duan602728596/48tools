import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    locale: 'zh-CN',
    ignoreHTTPSErrors: true
  },
  timeout: 600_000
};

export default config;