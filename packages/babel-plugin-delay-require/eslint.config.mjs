import eslintNode from '../../eslint/eslintNode.mjs';

const ignores = [
  'node_modules/**',
  'lib'
];

export default [
  { ignores },
  ...eslintNode
];