import './sourcemap.cjs';
import type { BabelFile } from '@babel/core';
import pluginVisitor from './pluginVisitor.cjs';
import type { BabelTypes, PluginOptions, BabelPluginDelayRequireObject } from './types.cjs';

function babelPluginDelayRequire({ types: t }: { types: BabelTypes }, options: PluginOptions): BabelPluginDelayRequireObject {
  const moduleNames: Array<string> = options?.moduleNames ?? [];
  const idle: boolean = options?.idle ?? false;
  const mountToGlobalThis: boolean = options?.mountToGlobalThis ?? false;
  const replaceModuleName: Record<string, string> = options?.replaceModuleName ?? {};

  const prefixVariableName: string = '__ELECTRON__DELAY_REQUIRE__';
  const prefixVariableNameRegexp: RegExp = new RegExp(prefixVariableName);

  return {
    name: 'babel-plugin-delay-require',

    pre(state: BabelFile): void {
      this.importInfoArray = [];
      this.useIdle = false;
    },

    visitor: pluginVisitor(t, {
      prefixVariableName,
      prefixVariableNameRegexp,
      options: {
        moduleNames,
        idle,
        mountToGlobalThis,
        replaceModuleName
      }
    })
  };
}

export default babelPluginDelayRequire;