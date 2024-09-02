import eslintNode from '../../eslint/eslintNode.mjs';

const ignores = [
  'node_modules/**',
  'dist',
  'ffmpeg/**'
];

export default [
  { ignores },
  ...eslintNode
];