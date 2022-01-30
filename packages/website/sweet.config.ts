import * as process from 'node:process';
import babel from 'vite-plugin-babel';
import { createHtmlPlugin } from 'vite-plugin-html';
import type { InlineConfig, Plugin } from 'vite';

const isDev: boolean = process.env.NODE_ENV === 'development';
const plugins: Array<Plugin | Plugin[]> = [];
const vite: InlineConfig = {};

if (!isDev) {
  plugins.push(
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugin: [['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]]
      }
    }),
    createHtmlPlugin({
      minify: true
    })
  );

  vite.build = { sourcemap: true };
}

export default {
  frame: 'react',
  plugins,
  vite
};
