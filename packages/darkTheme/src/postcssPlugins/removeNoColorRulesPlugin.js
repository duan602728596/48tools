/**
 * 删除没有颜色的值的css属性
 * @param { Array<import('postcss').ChildNode> } nodes
 */
function removeNoColorRules(nodes) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const item = nodes[i];

    if (!/#[\dA-Fa-f]{3,6}|rgba?|hsla?|hsv|transparent/i.test(item.value)) {
      item.remove();
    }
  }

  return nodes;
}

/**
 * postcss插件：删除没有颜色的值的css属性
 * @type { import('postcss').PluginCreator }
 * @return { import('postcss').Plugin }
 */
function postcssRemoveNoColorRulesPlugin() {
  return {
    postcssPlugin: 'postcss-remove-no-color-rules',

    /**
     * @param { import('postcss').Rule } rule
     */
    Rule(rule) {
      removeNoColorRules(rule.nodes);

      if (rule.nodes.length === 0) {
        rule.remove();
      }
    }
  };
}

postcssRemoveNoColorRulesPlugin.postcss = true;

export default postcssRemoveNoColorRulesPlugin;