import typescriptEslintParser from '@typescript-eslint/parser';
import { languageGlobalsOptions } from './globalsSettings.mjs';

export const eslintTypescriptRules = {
  // Supported Rules
  '@typescript-eslint/explicit-function-return-type': 'error', // 函数必须返回值
  '@typescript-eslint/member-delimiter-style': [ // 在接口和类型文字中强制使用一致的成员定界符样式
    'error',
    {
      multiline: { delimiter: 'semi', requireLast: true },
      singleline: { delimiter: 'semi', requireLast: false }
    }
  ],
  '@typescript-eslint/no-empty-interface': 'error', // 禁止空接口
  '@typescript-eslint/no-for-in-array': 'error',    // 禁止使用for-in循环遍历数组
  '@typescript-eslint/type-annotation-spacing': [   // 在类型注释周围需要一致的间距
    'error',
    {
      before: true,
      after: true,
      overrides: {
        colon: { before: false, after: true }
      }
    }
  ],
  '@typescript-eslint/typedef': [ // 需要存在类型定义
    'error',
    {
      arrayDestructuring: true,
      arrowParameter: true,
      memberVariableDeclaration: true,
      objectDestructuring: true,
      parameter: true,
      propertyDeclaration: true,
      variableDeclaration: true
    }
  ],
  // Extension Rules
  '@typescript-eslint/no-array-constructor': 'error', // 禁止使用new Array()，但是可以使用new Array<type>()
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': [ // 禁止变量声明覆盖外层作用域的变量
    'error',
    { hoist: 'all' }
  ],
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': 'error' // 禁止定义前使用
};

export const esLintTypescriptLanguageOptions = {
  parser: typescriptEslintParser,
  parserOptions: {
    project: 'tsconfig.json',
    createDefaultProgram: true,
    sourceType: 'module'
  },
  globals: languageGlobalsOptions
};

export const eslintTypescriptImportSettings = {
  'import/parsers': {
    '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts']
  },
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: 'tsconfig.json'
    },
    node: {
      extensions: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts']
    }
  }
};