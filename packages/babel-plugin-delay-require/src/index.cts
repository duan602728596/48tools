import './sourcemap.cjs';
import type { BabelFile } from '@babel/core';
import pluginVisitor from './pluginVisitor.cjs';
import type { BabelTypes, PluginOptions, BabelPluginDelayRequireObject } from './types.cjs';

function babelPluginDelayRequire({ types: t }: { types: BabelTypes }, options: PluginOptions): BabelPluginDelayRequireObject {
  const moduleNames: Array<string> = options?.moduleNames ?? [];
  const variableName: string | undefined = options?.variableName;
  const idle: boolean = options?.idle ?? false;
  const mountToGlobalThis: boolean = options?.mountToGlobalThis ?? false;

  const prefixVariableName: string = variableName ?? '__ELECTRON__DELAY_REQUIRE__';
  const prefixVariableNameRegexp: RegExp = mountToGlobalThis ? new RegExp(`^globalThis\\.${ prefixVariableName }`) : new RegExp(`^${ prefixVariableName }`);

  return {
    pre(state: BabelFile): void {
      this.importInfoArray = [];
      this.useIdle = false;
    },
    visitor: pluginVisitor(t, {
      prefixVariableName,
      prefixVariableNameRegexp,
      options: {
        moduleNames,
        variableName: prefixVariableName,
        idle,
        mountToGlobalThis
      }
    })
  };
}

export default babelPluginDelayRequire;