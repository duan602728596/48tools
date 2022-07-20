import { transformAsync } from '@babel/core';
import babelPluginDelayRequire from '../src/index.js';

const moduleNames = ['a', 'b', 'c'];

export async function transform(code) {
  return await transformAsync(code, {
    plugins: [[babelPluginDelayRequire, {
      moduleNames
    }]],
    ast: true
  });
}