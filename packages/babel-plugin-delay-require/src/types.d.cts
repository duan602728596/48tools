import type { PluginObj, PluginPass, Visitor } from '@babel/core';
import type * as BabelTypesSpecifier from '@babel/types';
import type { TraverseOptions } from '@babel/traverse';
import type { ImportInfo } from './utils/ImportInfo.cjs';

export type BabelTypes = typeof BabelTypesSpecifier;

/* 插件配置 */
export interface PluginOptions {
  moduleNames?: Array<string>;       // 用于延迟加载的模块数组
  variableName?: string | undefined; // 模块的变量名称的开头，用来标识是延迟加载的模块
  idle?: boolean;                    // 是否使用requestIdleCallback在空闲时间加载模块
}

export type PluginOptionsRequired = Required<PluginOptions>;

/* 插件对象 */
export interface BabelPluginDelayRequireState extends PluginPass {
  importInfoArray: Array<ImportInfo>;
  useIdle: boolean;
}

export type BabelPluginDelayRequireObject = PluginObj<BabelPluginDelayRequireState>;
export type BabelPluginDelayRequireVisitor = Visitor<BabelPluginDelayRequireState>;
export type VisitorThis = Pick<BabelPluginDelayRequireState, 'importInfoArray'>;
export type TraverseVisitor = TraverseOptions<VisitorThis>;