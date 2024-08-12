import type { VariableDeclaration, ExpressionStatement, OptionalCallExpression, MemberExpression, AssignmentExpression } from '@babel/types';
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
 */
export function idleExpressionStatement(t: BabelTypes, importInfo: ImportInfo): ExpressionStatement {
  const memberExpression: MemberExpression = t.memberExpression(t.identifier('globalThis'), t.identifier('requestIdleCallback'));
  const assignmentExpression: AssignmentExpression = t.assignmentExpression(
    '??=',
    t.identifier(importInfo.formatVariableName),
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
 */
export function globalThisRequireExpressionStatement(t: BabelTypes, importInfo: ImportInfo): ExpressionStatement {
  const assignmentExpression: AssignmentExpression = t.assignmentExpression(
    '??=',
    t.identifier(importInfo.formatVariableName),
    t.callExpression(
      t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
      [t.stringLiteral(importInfo.moduleName)]
    )
  );

  return t.expressionStatement(assignmentExpression);
}