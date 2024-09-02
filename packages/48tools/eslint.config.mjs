import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import { eslintRules as eslintBasicRules, esLintLanguageOptions } from '../../eslint/eslint.mjs';
import { eslintReactRules, eslintReactSettings } from '../../eslint/eslintReact.mjs';
import { eslintTypescriptRules, esLintTypescriptLanguageOptions, eslintTypescriptImportSettings } from '../../eslint/eslintTypescript.mjs';

const ignores = [
  'node_modules/**',
  '.sweet/dll/**',
  'lib',
  'dist',
  'src/pages/Toutiao/sdk',
  'src/utils/toutiao/Signer.js',
  '!src/pages/Toutiao/sdk/**/*.ts',
  '!src/pages/Toutiao/sdk/**/*.tsx',
  'src/pages/PlayerWindow/Danmu/sdk/NIM_Web_SDK_v8.0.0.js',
  'src/pages/48/sdk/1'
];

const plugins = {
  react: eslintPluginReact
};

const settings = {
  ...eslintReactSettings,
  ...eslintTypescriptImportSettings
};

const eslintRules = {
  ...eslintBasicRules,
  ...eslintReactRules
};

export default [
  { ignores },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: esLintTypescriptLanguageOptions,
    settings,
    plugins: {
      ...plugins,
      '@typescript-eslint': typescriptEslintPlugin
    },
    rules: { ...eslintRules, ...eslintTypescriptRules }
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: esLintLanguageOptions,
    settings,
    plugins,
    rules: eslintRules
  }
];