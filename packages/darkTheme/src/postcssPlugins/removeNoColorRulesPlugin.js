/* 删除没有颜色的值的css属性 */
function postcssRemoveNoColorRulesPlugin() {
  function removeRules(nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const item = nodes[i];

      if (!/#|rgba?|hsla?|hsv|transparent/i.test(item.value) ) {
        item.remove();
      }
    }

    return nodes;
  }

  return {
    postcssPlugin: 'postcss-remove-no-color-rules',
    Rule(rule) {
      removeRules(rule.nodes);

      if (rule.nodes.length === 0) {
        rule.remove();
      }
    }
  };
}

postcssRemoveNoColorRulesPlugin.postcss = true;

export default postcssRemoveNoColorRulesPlugin;