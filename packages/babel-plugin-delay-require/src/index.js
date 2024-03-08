const plugin = require('./plugin.js');

/**
 * @param { import('@babel/types') } t
 * @param { object } options
 * @param { Array<string> } options.moduleNames - 用于延迟加载的模块数组
 * @param { string | undefined } options.variableName - 模块的变量名称的开头，用来标识是延迟加载的模块
 * @param { boolean | undefined } options.idle - 使用requestIdleCallback在空闲时间加载模块
 */
function babelPluginDelayRequire({ types: t }, options) {
  const moduleNames = options?.moduleNames ?? [];
  const variableName = options?.variableName;
  const idle = options?.idle ?? false;

  return {
    pre(state) {
      this.importInfoArray = [];
    },
    visitor: plugin({
      t,
      moduleNames,
      variableName,
      idle
    }),
    post(state) { /* noop */ }
  };
}

module.exports = babelPluginDelayRequire;