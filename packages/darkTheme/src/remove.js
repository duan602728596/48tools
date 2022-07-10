import postcss from 'postcss';
import { metaHelper } from '@sweet-milktea/utils';

const { __dirname } = metaHelper(import.meta.url);

/* 删除无用的css属性 */
function postcssRemoveRulesPlugin() {
  function removeRules(nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const item = nodes[i];

      if (!/#|rgba?|transparent/i.test(item.value) ) {
        item.remove();
      }
    }

    return nodes;
  }

  return {
    postcssPlugin: 'postcss-remove-rules',
    Rule(rule) {
      removeRules(rule.nodes);

      if (rule.nodes.length === 0) {
        rule.remove();
      }
    }
  };
}

postcssRemoveRulesPlugin.postcss = true;

/* 删除无用的选择器 */
function postcssRemoveNotClassSelectorPlugin() {
  function removeSelector(nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const item = nodes[i];

      if (!['rule', 'atrule'].includes(item.type)) continue;

      if (
        /\.clearfix/i.test(item.selector)
        || item.type === 'atrule'
      ) {
        item.remove();
      }
    }

    return nodes;
  }

  return {
    postcssPlugin: 'postcss-remove-not-class-selector',
    Root(root) {
      removeSelector(root.nodes);
    },
    AtRule(atRule) {
      if (atRule.name === 'media') {
        removeSelector(atRule.nodes);
      }
    }
  };
}

postcssRemoveNotClassSelectorPlugin.postcss = true;

/**
 * 使用postcss移除多余的css属性，只保留颜色
 * @param { string } css
 */
async function remove(css) {
  const result = await postcss([
    postcssRemoveRulesPlugin,
    postcssRemoveNotClassSelectorPlugin
  ]).process(css, { from: undefined });

  return result.css;
}

export default remove;