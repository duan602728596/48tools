import * as process from 'node:process';
import { createHtmlPlugin } from 'vite-plugin-html';
import type { InlineConfig } from 'vite';

const isDev: boolean = process.env.NODE_ENV === 'development';

const vite: InlineConfig = {};

if (!isDev) {
  vite.plugins = [
    createHtmlPlugin({
      minify: true
    })
  ];

  vite.build = { sourcemap: true };
}

export default {
  frame: 'react',
  vite
};