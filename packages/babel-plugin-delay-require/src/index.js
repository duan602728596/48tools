const plugin = require('./plugin.js');

/**
 * @param { import('@babel/types') } t
 * @param { object } options
 * @param { Array<string> } options.moduleNames: 用于延迟加载的模块数组
 * @param { string | undefined } options.variableName: 模块的变量名称的开头，用来标识是延迟加载的模块
 */
function babelPluginDelayRequire({ types: t }, options) {
  const moduleNames = options?.moduleNames ?? [];
  const variableName = options?.variableName;

  return {
    pre(state) {
      this.importInfoArray = [];
    },
    visitor: plugin(t, moduleNames, variableName),
    post(state) { /* noop */ }
  };
}

module.exports = babelPluginDelayRequire;