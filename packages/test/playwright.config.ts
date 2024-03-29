import * as path from 'node:path';
import * as os from 'node:os';
import { metaHelper } from '@sweet-milktea/utils';
import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const { __dirname }: { __dirname: string } = metaHelper(import.meta.url);
const config: PlaywrightTestConfig = defineConfig({
  use: {
    locale: 'zh-CN',
    ignoreHTTPSErrors: true
  },
  testDir: path.join(__dirname, 'src'),
  outputDir: path.join(__dirname, 'dist'),
  workers: os.cpus().length,
  timeout: 1_200_000,
  testIgnore: [
    '**/src/tests',
    '**/src/vpTests'
  ]
});

export default config;