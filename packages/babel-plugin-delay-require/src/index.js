const plugin = require('./plugin.js');

/**
 * @param { import('@babel/types') } t
 * @param { object } options
 * @param { Array<string> } options.moduleNames
 */
function babelPluginDelayRequire({ types: t }, options) {
  const moduleNames = options?.moduleNames ?? [];
  const variableName = options?.variableName;

  return {
    visitor: plugin(t, moduleNames, variableName)
  };
}

module.exports = babelPluginDelayRequire;