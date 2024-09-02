import process from 'node:process';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginImport from 'eslint-plugin-import';
import { eslintRules as eslintBasicRules, esLintLanguageOptions } from './eslint/eslint.mjs';
import { eslintReactRules, eslintReactSettings } from './eslint/eslintReact.mjs';
import { eslintTypescriptRules, esLintTypescriptLanguageOptions, eslintTypescriptImportSettings } from './eslint/eslintTypescript.mjs';

const commitLint = process.env.COMMITLINT === '1';

const ignores = [
  'node_modules/**',
  '.yarn/**',
  '.husky/**',
  '.pnp.js',
  '.pnp.cjs',
  'packages/**/.sweet/dll/**',
  './app',
  './build',
  'lib',
  'dist',
  'www',
  'packages/48tools/src/pages/Toutiao/sdk',
  'packages/48tools/src/utils/toutiao/Signer.js',
  '!packages/48tools/src/pages/Toutiao/sdk/**/*.ts',
  '!packages/48tools/src/pages/Toutiao/sdk/**/*.tsx',
  'packages/48tools/src/pages/PlayerWindow/Danmu/sdk/NIM_Web_SDK_v8.0.0.js',
  'packages/48tools/src/pages/48/sdk/1',
  'packages/packages/main/.lib.mid/**'
];

const plugins = {
  react: eslintPluginReact,
  import: eslintPluginImport
};

const settings = {
  ...eslintReactSettings,
  ...eslintTypescriptImportSettings
};

const eslintRules = {
  ...eslintBasicRules,
  ...eslintReactRules,
  // import
  'import/no-unresolved': [ // 确保导入的模块可以解析为本地文件系统上的模块
    commitLint ? 'error' : 'off',
    {
      commonjs: true,
      ignore: ['filenamify/browser', 'SDK', '^@48tools-api/', '^@48tools-types/']
    }
  ]
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