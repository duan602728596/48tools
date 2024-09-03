import eslintNode from '../../eslint/eslintNodeConfig.mjs';

const ignores = [
  'node_modules/**',
  'lib',
  '.lib.mid/**'
];

export default [
  { ignores },
  ...eslintNode
];