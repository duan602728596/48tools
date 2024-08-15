import type { VariableDeclaration, ExpressionStatement, OptionalCallExpression, MemberExpression, AssignmentExpression, Identifier } from '@babel/types';
import type { BabelTypes } from '../types.cjs';
import type { ImportInfo } from './ImportInfo.cjs';

/**
 * 创建Node: let variableName;
 * @param { BabelTypes } t
 * @param { ImportInfo } importInfo
 */
export function variableDeclaration(t: BabelTypes, importInfo: ImportInfo): VariableDeclaration {
  return t.variableDeclaration(
    'let',
    [t.variableDeclarator(t.identifier(importInfo.formatVariableName))]
  );
}

/**
 * 创建node: globalThis.requestIdleCallback?.(() => variableName ??= globalThis.require(moduleName))
 * @param { BabelTypes } t
 * @param { ImportInfo } importInfo
 * @param { boolean } mountToGlobalThis
 */
export function idleExpressionStatement(t: BabelTypes, importInfo: ImportInfo, mountToGlobalThis: boolean): ExpressionStatement {
  const leftExpression: MemberExpression | Identifier = mountToGlobalThis
    ? t.memberExpression(t.identifier('globalThis'), t.identifier(importInfo.formatVariableName))
    : t.identifier(importInfo.formatVariableName);
  const memberExpression: MemberExpression = t.memberExpression(t.identifier('globalThis'), t.identifier('requestIdleCallback'));
  const assignmentExpression: AssignmentExpression = t.assignmentExpression('??=', leftExpression,
    t.callExpression(
      t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
      [t.stringLiteral(importInfo.moduleName)])
  );
  const optionalCallExpression: OptionalCallExpression = t.optionalCallExpression(
    memberExpression, [t.arrowFunctionExpression([], assignmentExpression)], true);

  return t.expressionStatement(optionalCallExpression);
}

/**
 * 创建Node: variableName ??= globalThis.require(moduleName)
 * @param { BabelTypes } t
 * @param { ImportInfo } importInfo
 * @param { boolean } mountToGlobalThis
 */
export function globalThisRequireExpressionStatement(t: BabelTypes, importInfo: ImportInfo, mountToGlobalThis: boolean): ExpressionStatement {
  const leftExpression: MemberExpression | Identifier = mountToGlobalThis
    ? t.memberExpression(t.identifier('globalThis'), t.identifier(importInfo.formatVariableName))
    : t.identifier(importInfo.formatVariableName);
  const assignmentExpression: AssignmentExpression = t.assignmentExpression('??=', leftExpression,
    t.callExpression(
      t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
      [t.stringLiteral(importInfo.moduleName)])
  );

  return t.expressionStatement(assignmentExpression);
}

/**
 * 通过数组创建MemberExpression
 * @param { BabelTypes } t
 * @param { Array<string> } array - 数组数量必须>1
 */
export function arrayToMemberExpression(t: BabelTypes, array: Array<string>): MemberExpression | null {
  if (!(array.length > 1)) return null;

  let memberExpression: MemberExpression | null = null;

  for (let i: number = 0, j: number = array.length - 2; i < array.length; i++) {
    const left: MemberExpression | Identifier = memberExpression ?? t.identifier(array[i]);
    const right: Identifier = t.identifier(array[i + 1]);

    memberExpression = t.memberExpression(left, right);

    if (i === j) break;
  }

  return memberExpression;
}