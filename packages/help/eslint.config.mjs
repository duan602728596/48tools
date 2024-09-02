import eslintNode from '../../eslint/eslintNode.mjs';

const ignores = [
  'node_modules/**',
  'dist'
];

export default [
  { ignores },
  ...eslintNode
];