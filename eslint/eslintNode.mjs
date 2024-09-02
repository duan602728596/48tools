import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import { eslintRules as eslintBasicRules, esLintLanguageOptions } from './eslint.mjs';
import { eslintTypescriptRules, esLintTypescriptLanguageOptions, eslintTypescriptImportSettings } from './eslintTypescript.mjs';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: esLintTypescriptLanguageOptions,
    settings: eslintTypescriptImportSettings,
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin
    },
    rules: { ...eslintBasicRules, ...eslintTypescriptRules }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: esLintLanguageOptions,
    rules: eslintBasicRules
  }
];