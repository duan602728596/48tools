import './sourcemap.cjs';
import type { Plugin, Rule, Helpers } from 'postcss';

interface PostcssPluginRemoveClassNamesOptions {
  removeClassNames?: Array<string>;
}

function postcssPluginRemoveClassNames(options: {} = {}): Plugin {
  const { removeClassNames = [] }: PostcssPluginRemoveClassNamesOptions = options;
  let selectorRegexp: RegExp | null = null;

  if (removeClassNames.length) {
    selectorRegexp = new RegExp(`^\\.(${ removeClassNames.join('|') })$`);
  }

  return {
    postcssPlugin: 'postcss-plugin-remove-classnames',

    Rule(rule: Rule, helper: Helpers): void {
      if (rule.type === 'rule' && selectorRegexp && selectorRegexp.test(rule.selector.trim())) {
        rule.remove();
      }
    }
  };
}

export default postcssPluginRemoveClassNames;