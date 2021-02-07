module.exports = {
  env: {
    browser: true,
    node: true,
    commonjs: true,
    'shared-node-browser': true,
    es6: true,
    es2017: true,
    es2020: true,
    worker: true,
    mocha: true,
    jest: true,
    jquery: true,
    serviceworker: true
  },
  parserOptions: {
    ecmaFeatures: {
      globalReturn: true,
      jsx: true
    },
    sourceType: 'module'
  },
  plugins: ['react', 'import'],
  settings: {
    react: {
      version: 'detect'
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.cjs', '.mjs', '.ts', '.tsx']
      }
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        createDefaultProgram: true
      },
      plugins: ['@typescript-eslint'],
      rules: {
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
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'error'  // 禁止定义前使用
      }
    },
    {
      files: ['*.js', '*.jsx'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false
      }
    }
  ],
  rules: {
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
    'template-curly-spacing': ['error', 'always'], // 要求或禁止模板字符串中的嵌入表达式周围空格的使用
    // React
    'react/button-has-type': 'error',               // 禁止<button>元素没有显式的"type"属性
    'react/void-dom-elements-no-children': 'error', // 防止接收子节点的无效DOM元素（例如<img />，<br />）
    // JSX
    'react/jsx-boolean-value': ['error', 'always'],       // 在JSX中使用布尔属性时，可以将属性值设置为true或省略值
    'react/jsx-closing-tag-location': 'error',            // 验证JSX中的结束标签位置
    'react/jsx-curly-brace-presence': ['error', 'never'], // 强制使用大括号或不使用不必要的大括号
    'react/jsx-curly-spacing': [ // 在JSX属性和表达式中强制或禁止花括号内的空格
      'error',
      {
        when: 'always',
        spacing: { objectLiterals: 'never' }
      }
    ],
    'react/jsx-equals-spacing': 'error',                 // 强制或禁止JSX属性中的等号周围的空格
    'react/jsx-first-prop-new-line': ['error', 'never'], // 此规则检查所有JSX元素的第一个属性是否正确放置
    'react/jsx-indent': ['error', 2],                    // 验证JSX缩进
    'react/jsx-indent-props': ['error', 2],              // 验证JSX中props的缩进
    'react/jsx-key': 'error',                            // 在数组或迭代器中验证JSX具有key属性
    'react/jsx-no-comment-textnodes': 'error',           // 防止将注释插入为文本节点
    'react/jsx-no-duplicate-props': 'error',             // 在JSX中防止重复的props
    'react/jsx-no-target-blank': [ // 创建具有标记的JSX元素时，通常需要使用target='_ blank'属性在新选项卡中打开链接
      'error',
      { enforceDynamicLinks: 'never' }
    ],
    'react/jsx-props-no-multi-spaces': 'error',           // 禁止内联JSX之间的多个空格
    'react/jsx-tag-spacing': [                            // 验证JSX左右括号中的空格
      'error',
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never'
      }
    ],
    // import
    'import/no-unresolved': [ // 确保导入的模块可以解析为本地文件系统上的模块
      'error',
      {
        commonjs: true,
        ignore: ['^worker-loader!']
      }
    ]
  }
};