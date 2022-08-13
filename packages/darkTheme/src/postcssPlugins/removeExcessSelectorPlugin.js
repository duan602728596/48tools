/* 删除无用的选择器 */
function postcssRemoveExcessSelectorPlugin() {
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
    postcssPlugin: 'postcss-remove-excess-selector',
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

postcssRemoveExcessSelectorPlugin.postcss = true;

export default postcssRemoveExcessSelectorPlugin;