const ImportInfo = require('./utils/ImportInfo.js');

/**
 * 修改绑定和引用
 * @param { import('@babel/core').NodePath<import('@babel/types').ImportDeclaration> } path - import节点路径
 * @param { ImportInfo } importInfo - 导入信息
 */
function variableRename(path, importInfo) {
  const exportDefault = importInfo.exportDefault ? '.default' : '';

  importInfo.variableName.forEach((variableName) => {
    path.scope.rename(variableName, `${ importInfo.formatVariableName }${ exportDefault }`);
  });

  if (importInfo.specifier.length) {
    importInfo.specifier.forEach(([a, b]) => {
      path.scope.rename(b ?? a, `${ importInfo.formatVariableName }.${ a }`);
    });
  }
}

/**
 * 创建Node: variableName ??= globalThis.require(moduleName)
 * @param { import('@babel/types') } t
 * @param { ImportInfo } importInfo
 */
function createGlobalRequireExpressionStatement(t, importInfo) {
  return t.expressionStatement(
    t.assignmentExpression(
      '??=',
      t.identifier(importInfo.formatVariableName),
      t.callExpression(
        t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
        [t.stringLiteral(importInfo.moduleName)]
      )
    )
  );
}

/**
 * 创建Node: let variableName;
 * @param { import('@babel/types') } t
 * @param { ImportInfo } importInfo
 */
function createVariableDeclaration(t, importInfo) {
  return t.variableDeclaration(
    'let',
    [t.variableDeclarator(t.identifier(importInfo.formatVariableName))]
  );
}

/**
 * 创建node: globalThis.requestIdleCallback?.(() => variableName ??= globalThis.require(moduleName))
 * @param { import('@babel/types') } t
 * @param { ImportInfo } importInfo
 */
function createIdleExpressionStatement(t, importInfo) {
  return t.expressionStatement(
    t.optionalCallExpression(
      t.memberExpression(t.identifier('globalThis'), t.identifier('requestIdleCallback')),
      [t.arrowFunctionExpression(
        [],
        t.assignmentExpression(
          '??=',
          t.identifier(importInfo.formatVariableName),
          t.callExpression(
            t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
            [t.stringLiteral(importInfo.moduleName)]
          )
        )
      )],
      true
    )
  );
}

/**
 * 查找作用域
 * @param { import('@babel/types') } t
 * @param { import('@babel/core').NodePath } path
 */
function findScope(t, path) {
  let scopePath = path.scope.path;
  let scopeBody = scopePath.node?.body?.body ?? scopePath.node?.body;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Array.isArray(scopeBody) || t.isFile(scopePath.parentPath.node) || !scopePath.parentPath) {
      break;
    }

    scopePath = scopePath.parentPath;
    scopeBody = scopePath.node?.body?.body ?? scopePath.node?.body;
  }

  return [scopePath, scopeBody];
}

/**
 * 查找父级作用域
 * @param { import('@babel/types') } t
 * @param { import('@babel/core').NodePath } path
 */
function findParentScope(t, path) {
  const parentScopePath = path?.parentPath;
  const parentScopeBody = parentScopePath?.node?.body?.body ?? parentScopePath?.node?.body;

  return [parentScopePath, parentScopeBody];
}

/**
 * 判断body中是否存在对应的表达式
 * @param { import('@babel/types') } t
 * @param { Array<import('@babel/core').Node> } body
 * @param { string } name
 * @param { import('@babel/core').Node } node
 */
function hasExpressionStatement(t, body, name, node) {
  return body.some((o) => t.isExpressionStatement(o)
    && o !== node
    && t.isAssignmentExpression(o.expression, { operator: '??=' })
    && t.isIdentifier(o.expression.left, { name }));
}

/**
 * @param { import('@babel/types') } t
 * @param { Array<string> } moduleNames
 * @param { string } variableName
 * @param { boolean } idle
 */
function plugin({ t, moduleNames, variableName, idle }) {
  const prefixVariableName = variableName ?? '__ELECTRON__DELAY_REQUIRE__';
  const prefixVariableNameRegexp = new RegExp(`^${ prefixVariableName }`);
  const filterGlobalTypes = [
    'VariableDeclarator',
    'ImportDefaultSpecifier',
    'ImportSpecifier',
    'ImportNamespaceSpecifier'
  ];

  // 获取模块加载的信息
  const ProgramEnterImportDeclarationVisitor = {
    ImportDefaultSpecifier(path) {
      this.importInfo.variableName.push(path.node.local.name);
      this.importInfo.exportDefault = true;
    },

    ImportNamespaceSpecifier(path) {
      this.importInfo.variableName.push(path.node.local.name);
      this.importInfo.exportDefault = false;
    },

    ImportSpecifier(path) {
      this.importInfo.specifier.push([
        path.node.imported.name,
        path.node.imported.name === path.node.local.name ? undefined : path.node.local.name
      ]);
    }
  };

  const ProgramEnterVisitor = {
    ImportDeclaration(path) {
      const sourceValue = path.node.source.value;

      if (moduleNames.includes(sourceValue)) {
        let importInfo = this.importInfoArray.find((o) => o.moduleName === sourceValue);

        if (!importInfo) {
          importInfo = new ImportInfo({
            prefixVariableName,
            moduleName: sourceValue
          });
          this.importInfoArray.push(importInfo);
        }

        path.traverse(ProgramEnterImportDeclarationVisitor, { importInfo });

      }
    }
  };

  const ProgramLevelVisitor = {
    ExpressionStatement(path) {
      // 查找父级作用域是否绑定过，绑定则删除
      if (
        t.isAssignmentExpression(path.node.expression, { operator: '??=' })
        && prefixVariableNameRegexp.test(path.node.expression.left.name)
      ) {
        const [scopePath] = findScope(t, path); // 当前作用域的path和body
        let isFatherFindVariable = false;
        let [parentScopePath, parentScopeBody] = findParentScope(t, scopePath);

        while (!isFatherFindVariable) {
          if (Array.isArray(parentScopeBody)) {
            isFatherFindVariable = hasExpressionStatement(t, parentScopeBody, path.node.expression.left.name, path.node);
          }

          if (isFatherFindVariable) break;

          [parentScopePath, parentScopeBody] = findParentScope(t, parentScopePath);

          if (!parentScopePath) break;
        }

        if (isFatherFindVariable) {
          path.remove();
        }
      }
    }
  };

  return {
    Program: {
      enter(path) {
        const body = path.node.body;

        // 获取模块加载的信息
        path.traverse(ProgramEnterVisitor, {
          importInfoArray: this.importInfoArray
        });

        // 插入模块
        if (this.importInfoArray.length > 0) {
          const index = body.findLastIndex((o) => t.isImportDeclaration(o));

          if (index >= 0) {
            const inject = this.importInfoArray.map((o) => createVariableDeclaration(t, o));

            body.splice(index + 1, 0, ...inject);
          }
        }

        // 修改绑定和引用
        this.importInfoArray.forEach((importInfo) => variableRename(path, importInfo));
      },

      exit(path) {
        path.traverse(ProgramLevelVisitor);

        if (idle && this?.importInfoArray?.length) {
          path.node.body.push(...this.importInfoArray.map((importInfo) => createIdleExpressionStatement(t, importInfo)));
        }
      }
    },

    ImportDeclaration: {
      exit(path) {
        // 删除被引用的模块
        if (this.importInfoArray.find((o) => t.isStringLiteral(path.node.source, { value: o.moduleName }))) {
          path.remove();
        }
      }
    },

    Identifier: {
      enter(path) {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 过滤全局变量
        if (filterGlobalTypes.includes(path.parentPath.node.type)) return;

        const members = path.node.name.split('.');

        if (members.length > 1) {
          path.replaceWith(
            t.memberExpression(
              t.Identifier(members[0]),
              t.Identifier(members[1])
            )
          );
        }
      },

      exit(path) {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 检查作用域
        const { name } = path.node;
        const importInfo = this.importInfoArray.find((o) => name === o.formatVariableName);

        if (!importInfo) return;

        const [scopePath, scopeBody] = findScope(t, path); // 当前作用域的path和body

        // 过滤全局变量
        if (filterGlobalTypes.includes(path.parentPath.node.type)) return;

        let body = scopeBody;

        // class时添加作用域的方式有变化
        if (t.isClassDeclaration(scopePath.node)) {
          if (!t.isStaticBlock(scopeBody[0])) {
            scopeBody.unshift(t.staticBlock([]));
          }

          body = scopeBody[0].body;
        }

        // 查找当前作用域是否绑定过
        if (hasExpressionStatement(t, body, importInfo.formatVariableName)) return;

        // 插入表达式
        const index = body.findLastIndex((o) => (
          // 局部作用域，添加到global.require之后
          t.isExpressionStatement(o)
          && t.isAssignmentExpression(o.expression, { operator: '??=' })
          && prefixVariableNameRegexp.test(o.expression.left.name)
        ) || (
          // 全局作用域时，添加到let之后
          t.isProgram(scopePath)
          && t.isVariableDeclaration(o, { kind: 'let' })
          && prefixVariableNameRegexp.test(o.declarations[0].id.name)
        ));
        const node = createGlobalRequireExpressionStatement(t, importInfo);

        if (index >= 0) {
          body.splice(index + 1, 0, node);
        } else {
          body.unshift(node);
        }
      }
    }
  };
}

module.exports = plugin;
