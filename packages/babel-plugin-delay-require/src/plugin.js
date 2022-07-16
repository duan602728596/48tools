const ImportInfo = require('./utils/ImportInfo.js');

/**
 * 修改绑定和引用
 * @param { import('@babel/core').NodePath<import('@babel/types').ImportDeclaration> } path: import节点路径
 * @param { ImportInfo } importInfo: 导入信息
 */
function variableRename(path, importInfo) {
  if (importInfo.specifier.length === 0) {
    if (importInfo.exportDefault) {
      path.scope.rename(importInfo.variableName, `${ importInfo.formatVariableName }.default`);
    } else {
      path.scope.rename(importInfo.variableName, importInfo.formatVariableName);
    }
  } else {
    importInfo.variableName
    && path.scope.rename(importInfo.variableName, `${ importInfo.formatVariableName }.default`);
    importInfo.specifier.forEach(([a, b]) => {
      path.scope.rename(b ?? a, `${ importInfo.formatVariableName }.${ a }`);
    });
  }
}

/**
 * 绑定变量
 * @param { Record<string, import('@babel/core').Binding> } bindings: 绑定作用域
 * @param { WeakMap } bindingMembersMap
 * @param { Array<string> } scopePathRequireMembers: 变量
 */
function setElectronRequireMembers(bindings, bindingMembersMap, scopePathRequireMembers) {
  (Object.values(bindings ?? {})).forEach((binding) => {
    const electronRequireMembers = bindingMembersMap.get(binding.path.node) ?? [];

    electronRequireMembers.push(...scopePathRequireMembers);
    bindingMembersMap.set(binding.path.node, Array.from(new Set(electronRequireMembers)));
  });
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
        t.memberExpression(t.identifier('global'), t.identifier('require')),
        [t.stringLiteral(importInfo.moduleName)]
      )
    )
  );
}

/**
 * @param { import('@babel/types') } t
 * @param { Array<string> } moduleName
 * @param { string } variableName
 */
function plugin(t, moduleName, variableName) {
  const prefixVariableName = variableName ?? '__ELECTRON__DELAY_REQUIRE__';
  const prefixVariableNameRegexp = new RegExp(`^${ prefixVariableName }`);
  const importInfoArray = [];
  const bindingMembersMap = new WeakMap();

  // 获取模块加载的信息
  const ImportDeclarationVisitor = {
    ImportDefaultSpecifier(path) {
      this.importInfo.variableName = path.node.local.name;
      this.importInfo.exportDefault = true;
    },

    ImportNamespaceSpecifier(path) {
      this.importInfo.variableName = path.node.local.name;
      this.importInfo.exportDefault = false;
    },

    ImportSpecifier(path) {
      this.importInfo.specifier.push([
        path.node.imported.name,
        path.node.imported.name === path.node.local.name ? undefined : path.node.local.name
      ]);
    }
  };
  const ProgramVisitor = {
    ImportDeclaration(path) {
      const importInfo = new ImportInfo({
        prefixVariableName,
        moduleName: path.node.source.value,
        specifier: []
      });

      path.traverse(ImportDeclarationVisitor, { importInfo });
      importInfoArray.push(importInfo);
    }
  };

  return {
    Program: {
      enter(path) {
        const body = path.node.body;

        // 获取模块加载的信息
        path.traverse(ProgramVisitor);

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
        if (
          t.isImportDeclaration(path.node)
          && importInfoArray.find((o) => t.isStringLiteral(path.node.source, { value: o.moduleName }))
        ) {
          path.remove();
        }
      }
    },

    Identifier: {
      enter(path) {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 过滤全局变量
        if ([
          'VariableDeclarator',
          'ImportDefaultSpecifier',
          'ImportSpecifier',
          'ImportNamespaceSpecifier'
        ].includes(path.parent.type)) return;

        const members = path.node.name.split('.');

        if (members.length > 1) {
          path.replaceWithMultiple(t.memberExpression(t.Identifier(members[0]), t.Identifier(members[1])));
        }
      },

      exit(path) {
        if (!prefixVariableNameRegexp.test(path.node.name)) return;

        // 检查作用域
        const { name } = path.node;
        const importInfo = importInfoArray.find((o) => name === o.formatVariableName);

        if (!importInfo) return;

        const scopePath = path.scope.path;
        const scopeBody = scopePath.type === 'Program' ? scopePath.node.body : scopePath.node.body.body;

        // 为子作用域添加标记
        const scopePathRequireMembers = bindingMembersMap.get(scopePath.node);

        if (scopePathRequireMembers?.length) {
          setElectronRequireMembers(scopePath.scope.bindings, bindingMembersMap, scopePathRequireMembers);
        }

        // 如果有变量，不需要添加
        if (bindingMembersMap.get(path.scope.block)?.includes?.(name)) return;

        // 过滤全局变量
        if ([
          'VariableDeclarator',
          'ImportDefaultSpecifier',
          'ImportSpecifier',
          'ImportNamespaceSpecifier'
        ].includes(path.parent.type)) return;

        // 查找当前作用域是否绑定过
        const findVariable = scopeBody.find((o) => t.isExpressionStatement(o)
          && t.isAssignmentExpression(o.expression, { operator: '??=' })
          && t.isIdentifier(o.expression.left, { name: importInfo.formatVariableName }));

        if (findVariable) return;

        // 插入表达式
        const index = scopeBody.findLastIndex((o) => t.isExpressionStatement(o)
          && t.isAssignmentExpression(o.expression, { operator: '??=' })
          && prefixVariableNameRegexp.test(o.expression.left.name));
        const node = createGlobalRequireExpressionStatement(t, importInfo);

        if (index >= 0) {
          scopeBody.splice(index + 1, 0, node);
        } else {
          scopeBody.unshift(node);
        }

        // 绑定当前的members
        setElectronRequireMembers(path.scope.bindings, bindingMembersMap, [name]);
      }
    }
  };
}

module.exports = plugin;