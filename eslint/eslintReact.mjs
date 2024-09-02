export const eslintReactRules = {
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
  'react/jsx-no-target-blank': [ // 创建具有标记的JSX元素时，通常需要使用target="_blank"属性在新选项卡中打开链接
    'error',
    { enforceDynamicLinks: 'never' }
  ],
  'react/jsx-props-no-multi-spaces': 'error', // 禁止内联JSX之间的多个空格
  'react/jsx-tag-spacing': [                  // 验证JSX左右括号中的空格
    'error',
    {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never'
    }
  ]
};

export const eslintReactSettings = {
  react: {
    version: 'detect'
  }
};