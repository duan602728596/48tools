const ImportInfo = require('./utils/ImportInfo.js');

/**
 * 修改绑定和引用
 * @param { import('@babel/core').NodePath<import('@babel/types').ImportDeclaration> } path: import节点路径
 * @param { ImportInfo } importInfo: 导入信息
 */
function variableRename(path, importInfo) {
  if (importInfo.specifier.length === 0) {
    const exportDefault = importInfo.exportDefault ? '.default' : '';

    importInfo.variableName.forEach((variableName) => {
      path.scope.rename(variableName, `${ importInfo.formatVariableName }${ exportDefault }`);
    });
  } else {
    importInfo.variableName.forEach((variableName) => {
      path.scope.rename(variableName, `${ importInfo.formatVariableName }.default`);
    });
    importInfo.specifier.forEach(([a, b]) => {
      path.scope.rename(b ?? a, `${ importInfo.formatVariableName }.${ a }`);
    });
  }
}

/**
 * 创建ast: variableName ??= global.require(moduleName)
 * @param { import('@babel/types') } t
 * @param { ImportInfo } importInfo
 */
function createGlobalRequireExpressionStatement(t, importInfo) {
  return t.expressionStatement(
    t.assignmentExpression('??=',
      t.identifier(importInfo.formatVariableName),
      t.callExpression(
        t.memberExpression(t.identifier('globalThis'), t.identifier('require')),
        [t.stringLiteral(importInfo.moduleName)]
      )
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
  let scopeBody = scopePath.node.body.body ?? scopePath.node.body;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Array.isArray(scopeBody) || t.isFile(scopePath.parentPath.node)) {
      break;
    }

    scopePath = scopePath.parentPath;
    scopeBody = scopePath.node?.body?.body ?? scopePath.node?.body;
  }

  return [scopePath, scopeBody];
}

/**
 * @param { import('@babel/types') } t
 * @param { Array<string> } moduleNames
 * @param { string } variableName
 */
function plugin(t, moduleNames, variableName) {
  const prefixVariableName = variableName ?? '__ELECTRON__DELAY_REQUIRE__';
  const prefixVariableNameRegexp = new RegExp(`^${ prefixVariableName }`);
  const importInfoArray = [];
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
        let importInfo = importInfoArray.find((o) => o.moduleName === sourceValue);

        if (!importInfo) {
          importInfo = new ImportInfo({
            prefixVariableName,
            moduleName: sourceValue
          });
          importInfoArray.push(importInfo);
        }

        path.traverse(ProgramEnterImportDeclarationVisitor, { importInfo });

      }
    }
  };

  return {
    Program: {
      enter(path) {
        const body = path.node.body;

        // 获取模块加载的信息
        path.traverse(ProgramEnterVisitor);

        // 插入模块
        if (importInfoArray.length > 0) {
          const index = body.findLastIndex((o) => t.isImportDeclaration(o));

          if (index >= 0) {
            const inject = importInfoArray.map((o) => t.variableDeclaration(
              'let', [t.variableDeclarator(t.identifier(o.formatVariableName))]));

            body.splice(index + 1, 0, ...inject);
          }
        }

        // 修改绑定和引用
        importInfoArray.forEach((importInfo) => variableRename(path, importInfo));
      }
    },

    ImportDeclaration: {
      exit(path) {
        // 删除被引用的模块
        if (importInfoArray.find((o) => t.isStringLiteral(path.node.source, { value: o.moduleName }))) {
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
          path.replaceWith(t.memberExpression(t.Identifier(members[0]), t.Identifier(members[1])));
        }
      },

      exit(path) {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 检查作用域
        const { name } = path.node;
        const importInfo = importInfoArray.find((o) => name === o.formatVariableName);

        if (!importInfo) return;

        const [scopePath, scopeBody] = findScope(t, path);

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
        const findVariable = body.some((o) => t.isExpressionStatement(o)
          && t.isAssignmentExpression(o.expression, { operator: '??=' })
          && t.isIdentifier(o.expression.left, { name: importInfo.formatVariableName }));

        if (findVariable) return;

        // 插入表达式
        const scopePathIsProgram = t.isProgram(scopePath);
        const index = body.findLastIndex((o) => (t.isExpressionStatement(o)
          && t.isAssignmentExpression(o.expression, { operator: '??=' })
          && prefixVariableNameRegexp.test(o.expression.left.name))
          || (scopePathIsProgram
          && t.isVariableDeclaration(o, { kind: 'let' })
          && prefixVariableNameRegexp.test(o.declarations[0].id.name))
        );
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