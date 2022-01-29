import * as process from 'node:process';
import babel from 'vite-plugin-babel';
import type { Plugin } from 'vite';

const isDev: boolean = process.env.NODE_ENV === 'development';
const plugins: Array<Plugin> = [];

if (!isDev) {
  plugins.push(
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugin: [['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]]
      }
    })
  );
}

export default {
  frame: 'react',
  plugins
};
