import type { NodePath } from '@babel/core';
import type {
  Program,
  Statement,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  VariableDeclaration,
  ExpressionStatement,
  Identifier,
  MemberExpression,
  Expression,
  PrivateName
} from '@babel/types';
import type { TraverseOptions } from '@babel/traverse';
import { ImportInfo } from './utils/ImportInfo.cjs';
import * as c from './utils/createNode.cjs';
import * as h from './utils/helper.cjs';
import {
  FindScopeReturn,
  FindParentScopeReturn,
  FindScopeBody,
  ClassBodyArray,
  hasUseIdleDirective
} from './utils/helper.cjs';
import type {
  BabelTypes,
  PluginOptionsRequired,
  BabelPluginDelayRequireState,
  BabelPluginDelayRequireVisitor,
  VisitorThis,
  TraverseVisitor
} from './types.cjs';

const filterGlobalTypes: Array<string> = [
  'VariableDeclarator',
  'ImportDefaultSpecifier',
  'ImportSpecifier',
  'ImportNamespaceSpecifier'
];

interface PluginVisitorOptions {
  prefixVariableName: string;
  prefixVariableNameRegexp: RegExp;
  options: PluginOptionsRequired;
}

/* 查找父级作用域是否绑定过，绑定则删除 */
function ProgramLevelVisitor(t: BabelTypes, prefixVariableNameRegexp: RegExp, mountToGlobalThis: boolean): TraverseOptions {
  /**
   * 删除绑定的作用域
   * @param { NodePath } path - 当前节点
   * @param { string } name - 变量名
   */
  function _removeDuplicateNode(path: NodePath<ExpressionStatement>, name: string): void {
    const findScopeResult: FindScopeReturn = h.findScope(t, path); // 当前作用域的path和body
    let isFatherFindVariable: boolean = false;
    let findParentScopeResult: FindParentScopeReturn = h.findParentScope(findScopeResult.path);

    while (!isFatherFindVariable) {
      if (Array.isArray(findParentScopeResult.body)) {
        isFatherFindVariable = h.hasExpressionStatement(t, findParentScopeResult.body, name, mountToGlobalThis, path.node);
      }

      if (isFatherFindVariable) break;

      findParentScopeResult = h.findParentScope(findParentScopeResult.path);

      if (!findParentScopeResult.path) break;
    }

    if (isFatherFindVariable) path.remove();
  }

  return {
    ExpressionStatement(path: NodePath<ExpressionStatement>): void {
      if (
        !mountToGlobalThis
        && t.isAssignmentExpression(path.node.expression, { operator: '??=' })
        && ('name' in path.node.expression.left)
        && prefixVariableNameRegexp.test(path.node.expression.left.name)
      ) {
        _removeDuplicateNode(path, path.node.expression.left.name);
      }

      if (
        mountToGlobalThis
        && t.isAssignmentExpression(path.node.expression, { operator: '??=' })
        && t.isMemberExpression(path.node.expression.left)
        && t.isIdentifier(path.node.expression.left.object)
        && t.isIdentifier(path.node.expression.left.property)
        && prefixVariableNameRegexp.test(`${ path.node.expression.left.object.name }.${ path.node.expression.left.property.name }`)
      ) {
        _removeDuplicateNode(path, path.node.expression.left.property.name);
      }
    }
  };
}

/* 获取模块加载的信息 */
function ProgramEnterVisitor(options: PluginOptionsRequired, prefixVariableName: string): TraverseVisitor {
  type ProgramEnterImportDeclarationVisitorState = { importInfo: ImportInfo };

  const ProgramEnterImportDeclarationVisitor: TraverseOptions<ProgramEnterImportDeclarationVisitorState> = {
    ImportDefaultSpecifier(this: ProgramEnterImportDeclarationVisitorState, path: NodePath<ImportDefaultSpecifier>): void {
      this.importInfo.variableName.push(path.node.local.name);
      this.importInfo.exportDefault = true;
    },

    ImportNamespaceSpecifier(this: ProgramEnterImportDeclarationVisitorState, path: NodePath<ImportNamespaceSpecifier>): void {
      this.importInfo.variableName.push(path.node.local.name);
      this.importInfo.exportDefault = false;
    },

    ImportSpecifier(this: ProgramEnterImportDeclarationVisitorState, path: NodePath<ImportSpecifier>): void {
      if ('name' in path.node.imported) {
        this.importInfo.specifier.push([
          path.node.imported.name,
          path.node.imported.name === path.node.local.name ? undefined : path.node.local.name
        ]);
      }
    }
  };

  return {
    ImportDeclaration(this: VisitorThis, path: NodePath<ImportDeclaration>): void {
      const sourceValue: string = path.node.source.value;

      if (!options.moduleNames.includes(sourceValue)) return;

      let importInfo: ImportInfo | undefined = this.importInfoArray.find((o: ImportInfo): boolean => o.moduleName === sourceValue);

      if (!importInfo) {
        importInfo = new ImportInfo({
          prefixVariableName,
          moduleName: sourceValue
        });
        this.importInfoArray.push(importInfo);
      }

      path.traverse(ProgramEnterImportDeclarationVisitor, { importInfo });
    }
  };
}

/* 插件入口 */
function pluginVisitor(t: BabelTypes, { prefixVariableName, prefixVariableNameRegexp, options }: PluginVisitorOptions): BabelPluginDelayRequireVisitor {
  /**
   * 插入表达式
   * @param { NodePath } path - 当前节点
   * @param { string } name - 变量名
   */
  function _insertExpression(this: BabelPluginDelayRequireState, path: NodePath, name: string): void {
    const importInfo: ImportInfo | undefined = this.importInfoArray.find((o: ImportInfo): boolean => name === o.formatVariableName);

    if (!importInfo) return;

    const findScopeResult: FindScopeReturn = h.findScope(t, path); // 当前作用域的path和body
    let body: FindScopeBody = findScopeResult.body;

    // class时添加作用域的方式有变化
    const modifiedBody: ClassBodyArray | undefined = h.isClassDeclarationAndModifiedStaticBlock(t, findScopeResult);

    modifiedBody && (body = modifiedBody);

    // 查找当前作用域是否绑定过
    if (!Array.isArray(body) || h.hasExpressionStatement(t, body, importInfo.formatVariableName, options.mountToGlobalThis)) return;

    // 插入表达式
    const index: number = h.findLatestInsertExpression(t, body, findScopeResult.path.node, prefixVariableNameRegexp);

    body.splice(index >= 0 ? index + 1 : 0, 0, c.globalThisRequireExpressionStatement(t, importInfo, options.mountToGlobalThis));
  }

  const visitor: BabelPluginDelayRequireVisitor = {
    Program: {
      enter(this: BabelPluginDelayRequireState, path: NodePath<Program>): void {
        const body: Array<Statement> = path.node.body;

        this.useIdle = hasUseIdleDirective(t, path.node.directives);

        // 获取模块加载的信息
        path.traverse(ProgramEnterVisitor(options, prefixVariableName), { importInfoArray: this.importInfoArray });

        // 插入模块
        if (!options.mountToGlobalThis && this.importInfoArray.length > 0) {
          const index: number = body.findLastIndex((o: Statement): boolean => t.isImportDeclaration(o));

          if (index >= 0) {
            body.splice(index + 1, 0, ...this.importInfoArray.map((o: ImportInfo): VariableDeclaration => c.variableDeclaration(t, o)));
          }
        }

        // 修改绑定和引用
        this.importInfoArray.forEach((importInfo: ImportInfo): void => h.variableRename(path, importInfo, options.mountToGlobalThis));
      },

      exit(this: BabelPluginDelayRequireState, path: NodePath<Program>): void {
        path.traverse(ProgramLevelVisitor(t, prefixVariableNameRegexp, options.mountToGlobalThis));

        if ((options.idle || this.useIdle) && this.importInfoArray.length) {
          path.node.body.push(...this.importInfoArray.map((importInfo: ImportInfo) => c.idleExpressionStatement(t, importInfo, options.mountToGlobalThis)));
        }
      }
    },

    ImportDeclaration: {
      exit(this: BabelPluginDelayRequireState, path: NodePath<ImportDeclaration>): void {
        // 删除被引用的模块
        if (this.importInfoArray.find((o: ImportInfo) => t.isStringLiteral(path.node.source, { value: o.moduleName }))) {
          path.remove();
        }
      }
    },

    Identifier: {
      enter(this: BabelPluginDelayRequireState, path: NodePath<Identifier>): void {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 过滤全局变量
        if (filterGlobalTypes.includes(path.parentPath.node.type)) return;

        // 将字符串的变量拆分为memberExpression
        const replaceMemberExpression: MemberExpression | null = c.arrayToMemberExpression(t, path.node.name.split('.'));

        if (replaceMemberExpression) path.replaceWith(replaceMemberExpression);
      },

      exit(this: BabelPluginDelayRequireState, path: NodePath<Identifier>): void {
        if (!prefixVariableNameRegexp.test(path.node.name) || filterGlobalTypes.includes(path.parentPath.node.type)) return;

        // 检查作用域
        const { name }: Identifier = path.node;

        _insertExpression.call(this, path, name);
      }
    }
  };

  const mountToGlobalThisVisitor: BabelPluginDelayRequireVisitor = {
    MemberExpression: {
      exit(path: NodePath<MemberExpression>): void {
        const [left, right]: [Expression, Expression | PrivateName] = [path.node.object, path.node.property];

        if (!(t.isIdentifier(left) && t.isIdentifier(right))) return;

        if (!prefixVariableNameRegexp.test(`${ left.name }.${ right.name }`)) return;

        // 检查作用域
        _insertExpression.call(this, path, right.name);
      }
    }
  };

  if (options.mountToGlobalThis) {
    Object.assign(visitor, mountToGlobalThisVisitor);
  }

  return visitor;
}

export default pluginVisitor;