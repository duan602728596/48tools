import * as process from 'node:process';
import babel from 'vite-plugin-babel';
import { createHtmlPlugin } from 'vite-plugin-html';
import type { InlineConfig } from 'vite';

const isDev: boolean = process.env.NODE_ENV === 'development';

const vite: InlineConfig = {};

if (!isDev) {
  vite.plugins = [
    createHtmlPlugin({
      minify: true
    }),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]]
      }
    })
  ];

  vite.build = { sourcemap: true };
}

export default {
  frame: 'react',
  vite
};