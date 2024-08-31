import { transformAsync } from '@babel/core';
import babelPluginDelayRequire from '../lib/index.cjs';

const moduleNames = ['a', 'b', 'c'];

export async function transform(code, idle, mountToGlobalThis, replaceModuleName) {
  return await transformAsync(code, {
    plugins: [[babelPluginDelayRequire, {
      moduleNames,
      idle,
      mountToGlobalThis,
      replaceModuleName
    }]],
    ast: true
  });
}