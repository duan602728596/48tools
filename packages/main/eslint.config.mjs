import eslintNode from '../../eslint/eslintNode.mjs';

const ignores = [
  'node_modules/**',
  'lib',
  '.lib.mid/**'
];

export default [
  { ignores },
  ...eslintNode
];