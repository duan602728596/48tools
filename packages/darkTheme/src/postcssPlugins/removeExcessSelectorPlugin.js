/**
 * 移除满足条件的css选择器
 * @param { Array<import('postcss').ChildNode> } nodes
 */
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

/**
 * postcss插件：删除无用的选择器
 * @type { import('postcss').PluginCreator }
 * @return { import('postcss').Plugin }
 */
function postcssRemoveExcessSelectorPlugin() {
  return {
    postcssPlugin: 'postcss-remove-excess-selector',

    /**
     * @param { import('postcss').Root } root
     */
    Root(root) {
      removeSelector(root.nodes);
    },

    /**
     * @param { import('postcss').AtRule } atRule
     */
    AtRule(atRule) {
      if (atRule.name === 'media') {
        removeSelector(atRule.nodes);
      }
    }
  };
}

postcssRemoveExcessSelectorPlugin.postcss = true;

export default postcssRemoveExcessSelectorPlugin;