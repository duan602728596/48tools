import globals from 'globals';

function globalsSettings(keys) {
  const globalsObject = {};

  keys.forEach((key) => Object.assign(globalsObject, globals[key]));

  for (let i = 15; i <= 25; i++ ) {
    Object.assign(globalsObject, globals[`es20${ i }`]);
  }

  return globalsObject;
}

export const languageGlobalsOptions = {
  NodeJS: 'readonly',
  NodeRequire: 'readonly',
  ...globalsSettings(['browser', 'chai', 'commonjs', 'es5', 'mocha', 'node', 'nodeBuiltin', 'worker'])
};