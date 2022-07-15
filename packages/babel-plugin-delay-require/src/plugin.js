const { ImportInfo } = require('./utils.js');

/**
 * @param { import('@babel/types') } t
 * @param { Array<string> } moduleName
 */
function plugin(t, moduleName) {
  const importInfoArray = [];

  return {
    Program: {
      enter(path) {
        const body = path.node.body;

        // 获取模块加载的信息
        body.forEach((item) => {
          if (t.isImportDeclaration(item)) {
            const importInfo = new ImportInfo({
              moduleName: item.source.value,
              specifier: []
            });

            item.specifiers.forEach((sourceItem) => {
              if (t.isImportDefaultSpecifier(sourceItem)) {
                importInfo.variableName = sourceItem.local.name;
                importInfo.exportDefault = true;
              } else if (t.isImportNamespaceSpecifier(sourceItem)) {
                importInfo.variableName = sourceItem.local.name;
                importInfo.exportDefault = false;
              } else if (t.isImportSpecifier(sourceItem)) {
                importInfo.specifier.push([
                  sourceItem.imported.name,
                  sourceItem.imported.name === sourceItem.local.name ? undefined : sourceItem.local.name
                ]);
              }
            });

            importInfoArray.push(importInfo);
          }
        });

        // 删除模块
        if (importInfoArray.length > 0) {
          const index = body.findLastIndex((o) => t.isImportDeclaration(o));

          if (index >= 0) {
            const inject = importInfoArray.map(
              (o) => t.variableDeclaration('let', [t.variableDeclarator(t.identifier(o.formatVariableName))]));

            body.splice(index + 1, 0, ...inject);
          }

          for (let i = body.length - 1; i >= 0; i--) {
            if (t.isImportDeclaration(body[i]) && importInfoArray.find((o) => body[i].source.value === o.moduleName)) {
              body.splice(i, 1);
            }
          }
        }

        // 修改绑定和引用
        importInfoArray.forEach((importInfo) => {
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
        });
      },
      exit(path) { /**/ }
    },

    Identifier: {
      enter(path) {
        if (/^__ELECTRON__DELAY_REQUIRE__/.test(path.node.name)) {
          // 检查作用域
          const members = path.node.name.split('.');
          const importInfo = importInfoArray.find((o) => members[0] === o.formatVariableName);

          if (importInfo) {
            const scopePath = path.scope.path;
            const scopeBody = scopePath.type === 'Program' ? scopePath.node.body : scopePath.node.body.body;

            // 过滤全局变量
            if (path.parent.type === 'VariableDeclarator') {
              return;
            }

            // 查找当前作用域是否绑定过
            // console.log(Object.keys(path.scope.bindings));
            const findVariable = scopeBody.find((o) => {
              if (
                o.type === 'ExpressionStatement'
                && o.expression.type === 'AssignmentExpression'
                && o.expression.operator === '??='
                && o.expression.left.name === importInfo.formatVariableName
              ) {
                return true;
              }
            });

            if (!findVariable) {
              // 插入表达式
              const index = scopeBody.findLastIndex((o) => {
                if (
                  o.type === 'ExpressionStatement'
                  && o.expression.type === 'AssignmentExpression'
                  && o.expression.operator === '??='
                  && /^__ELECTRON__DELAY_REQUIRE__/.test(o.expression.left.name)
                ) {
                  return true;
                }
              });

              const node = t.expressionStatement(
                t.assignmentExpression('??=',
                  t.identifier(importInfo.formatVariableName),
                  t.callExpression(
                    t.memberExpression(t.identifier('global'), t.identifier('require')),
                    [t.stringLiteral(importInfo.moduleName)]
                  ))
              );

              if (index >= 0) {
                scopeBody.splice(index + 1, 0, node);
              } else {
                scopeBody.unshift(node);
              }
            }
          }
        }
      },
      exit(path) { /**/ }
    }
  };
}

module.exports = plugin;