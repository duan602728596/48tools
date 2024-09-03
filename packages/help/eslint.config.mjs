import eslintNode from '../../eslint/eslintNodeConfig.mjs';

const ignores = [
  'node_modules/**',
  'dist'
];

export default [
  { ignores },
  ...eslintNode
];