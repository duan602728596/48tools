import eslintNode from '../../eslint/eslintNodeConfig.mjs';

const ignores = [
  'node_modules/**',
  'lib'
];

export default [
  { ignores },
  ...eslintNode
];