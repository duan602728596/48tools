const plugin = require('./plugin.js');

/**
 * @param { import('@babel/types') } t
 * @param { object } options
 * @param { Array<string> } options.moduleNames
 * @param { string | undefined } options.variableName
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