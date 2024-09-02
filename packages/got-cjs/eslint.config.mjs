import { eslintRules as eslintBasicRules, esLintLanguageOptions } from '../../eslint/eslint.mjs';

const ignores = [
  'node_modules/**',
  'dist'
];

export default [
  { ignores },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: esLintLanguageOptions,
    rules: eslintBasicRules
  }
];