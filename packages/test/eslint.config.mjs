import eslintNode from '../../eslint/eslintNodeConfig.mjs';

const ignores = [
  'node_modules/**',
  'dist',
  'ffmpeg/**'
];

export default [
  { ignores },
  ...eslintNode
];