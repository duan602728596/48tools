const plugin = require('./plugin.js');

/**
 * @param { import('@babel/types') } t
 * @param { object } options
 * @param { Array<string> } options.moduleName
 */
function babelPluginDelayRequire({ types: t }, options) {
  const moduleName = options?.moduleName ?? [];

  return {
    visitor: plugin(t, moduleName)
  };
}

module.exports = babelPluginDelayRequire;