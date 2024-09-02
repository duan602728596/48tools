import babelEslintParser from '@babel/eslint-parser';
import { languageGlobalsOptions } from './globalsSettings.mjs';

export const eslintRules = {
  // Possible Errors
  'no-cond-assign': ['error', 'always'], // 禁止条件表达式中出现赋值操作符
  'no-constant-condition': [             // 禁止在条件中使用常量表达式
    'error',
    { checkLoops: true }
  ],
  'no-dupe-args': 'error',               // 禁止 function 定义中出现重名参数
  'no-dupe-keys': 'error',               // 禁止对象字面量中出现重复的 key
  'no-duplicate-case': 'error',          // 禁止出现重复的 case 标签
  'no-ex-assign': 'error',               // 禁止对 catch 子句的参数重新赋值
  'no-extra-boolean-cast': 'error',      // 禁止不必要的布尔转换
  'no-extra-semi': 'error',              // 禁止不必要的分号
  'no-func-assign': 'error',             // 禁止对 function 声明重新赋值
  'no-inner-declarations': 'error',      // 禁止在嵌套的块中出现变量声明或 function 声明
  'no-invalid-regexp': 'error',          // 禁止 RegExp 构造函数中存在无效的正则表达式字符串
  'no-obj-calls': 'error',               // 禁止把全局对象作为函数调用
  'no-prototype-builtins': 'error',      // 禁止直接调用 Object.prototypes 的内置属性
  'no-sparse-arrays': 'error',           // 禁用稀疏数组
  'no-unexpected-multiline': 'error',    // 禁止出现令人困惑的多行表达式
  'use-isnan': 'error',                  // 要求使用 isNaN() 检查 NaN
  'valid-typeof': 'error',               // 强制 typeof 表达式与有效的字符串进行比较
  // Best Practices
  'block-scoped-var': 'error',           // 强制把变量的使用限制在其定义的作用域范围内
  curly: ['error', 'multi-line'],        // 要求遵循大括号约定
  'dot-location': ['error', 'property'], // 强制在点号之前和之后一致的换行
  eqeqeq: ['error', 'always'],           // 要求使用 === 和 !==
  'no-empty-function': 'error',          // 禁止出现空函数
  'no-eval': 'error',                    // 禁用 eval()
  'no-implied-eval': 'error',            // 禁用隐式的eval()
  'no-multi-spaces': [                   // 禁止出现多个空格
    'error',
    { ignoreEOLComments: true }
  ],
  'no-new-func': 'error',                  // 禁止对 Function 对象使用 new 操作符
  'no-new-wrappers': 'error',              // 禁止对 String，Number 和 Boolean 使用 new 操作符
  'no-param-reassign': 'error',            // 禁止对 function 的参数进行重新赋值
  'no-redeclare': 'error',                 // 禁止多次声明同一变量
  'no-script-url': 'error',                // 禁止使用 javascript: url
  'no-self-assign': 'error',               // 禁止自我赋值
  'no-self-compare': 'error',              // 禁止自身比较
  'no-sequences': 'error',                 // 禁用逗号操作符
  'require-await': 'error',                // 禁止使用不带 await 表达式的 async 函数
  // Variables
  'no-delete-var': 'error',                // 禁止删除变量
  'no-label-var': 'error',                 // 禁用与变量同名的标签
  'no-shadow': [                           // 禁止变量声明覆盖外层作用域的变量
    'error',
    { hoist: 'all' }
  ],
  'no-undef': 'error',                     // 禁用未声明的变量
  'no-use-before-define': 'error',         // 禁止定义前使用
  // Node.js and CommonJS
  'no-new-require': 'error',               // 禁止调用 require 时使用 new 操作符
  // Stylistic Issues
  'array-bracket-spacing': 'error',        // 强制数组方括号中使用一致的空格
  'block-spacing': 'error',                // 禁止或强制在代码块中开括号前和闭括号后有空格
  'brace-style': 'error',                  // 强制在代码块中使用一致的大括号风格
  'comma-dangle': ['error', 'never'],      // 要求或禁止末尾逗号
  'comma-spacing': 'error',                // 强制在逗号前后使用一致的空格
  indent: ['error', 2, { SwitchCase: 1 }], // 强制使用一致的缩进
  'jsx-quotes': 'error',                   // 强制在 JSX 属性中一致地使用双引号或单引号
  'key-spacing': [                         // 强制在对象字面量的属性中键和值之间使用一致的间距
    'error',
    {
      beforeColon: false,
      afterColon: true,
      mode: 'strict'
    }
  ],
  'keyword-spacing': 'error',          // 强制在关键字前后使用一致的空格
  'no-mixed-operators': 'error',       // 禁止混合使用不同的操作符
  'no-mixed-spaces-and-tabs': 'error', // 禁止空格和 tab 的混合缩进
  'no-multiple-empty-lines': [
    'error',
    {
      max: 2,
      maxEOF: 0,
      maxBOF: 0
    }
  ],
  'no-new-object': 'error', // 禁用 Object 的构造函数
  'no-tabs': 'error',       // 禁用 tab
  'no-trailing-spaces': [   // 禁用行尾空格
    'error',
    {
      skipBlankLines: true,
      ignoreComments: true
    }
  ],
  'no-whitespace-before-property': 'error',    // 禁止属性前有空白
  'object-curly-spacing': ['error', 'always'], // 强制在大括号中使用一致的空格
  'operator-linebreak': ['error', 'before'],   // 强制操作符使用一致的换行符
  'padding-line-between-statements': [         // 要求或禁止在语句间填充空行
    'error',
    {
      blankLine: 'always',
      prev: ['const', 'let', 'var'],
      next: '*'
    },
    {
      blankLine: 'any',
      prev: ['const', 'let', 'var'],
      next: ['const', 'let', 'var']
    },
    {
      blankLine: 'always',
      prev: '*',
      next: 'return'
    }
  ],
  quotes: ['error', 'single', { avoidEscape: true }], // 强制使用一致的反勾号、双引号或单引号
  semi: ['error', 'always'],                          // 要求或禁止使用分号代替 ASI
  'space-before-blocks': ['error', 'always'],         // 强制在块之前使用一致的空格
  'space-before-function-paren': [                    // 强制在 function 的左括号之前使用一致的空格
    'error',
    {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }
  ],
  'space-infix-ops': 'error',                    // 要求操作符周围有空格
  'space-unary-ops': ['error', { words: true }], // 要求或禁止在一元操作符之前或之后存在空格
  'spaced-comment': 'error',                     // 强制在注释中 // 或 /* 使用一致的空格
  // ECMAScript 6
  'arrow-parens': ['error', 'always'], // 要求箭头函数的参数使用圆括号
  'arrow-spacing': [                   // 强制箭头函数的箭头前后使用一致的空格
    'error',
    {
      before: true,
      after: true
    }
  ],
  'constructor-super': 'error',                  // 要求在构造函数中有 super() 的调用
  'no-this-before-super': 'error',               // 禁止在构造函数中，在调用 super() 之前使用 this 或 super
  'no-var': 'error',                             // 要求使用 let 或 const 而不是 var
  'prefer-const': 'error',                       // 要求使用 const 声明那些声明后不再被修改的变量
  'object-shorthand': 'error',                   // 要求或禁止对象字面量中方法和属性使用简写语法
  'require-yield': 'error',                      // 要求 generator 函数内有 yield
  'template-curly-spacing': ['error', 'always']  // 要求或禁止模板字符串中的嵌入表达式周围空格的使用
};

export const esLintLanguageOptions = {
  parser: babelEslintParser,
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: [[
        '@sweet-milktea/babel-preset-sweet',
        { env: { ecmascript: true } }
      ]]
    },
    sourceType: 'module'
  },
  globals: languageGlobalsOptions
};