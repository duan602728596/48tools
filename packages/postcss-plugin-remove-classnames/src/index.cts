import './sourcemap.cjs';
import type { Plugin, Rule, Helpers, AtRule } from 'postcss';

interface PostcssPluginRemoveClassNamesOptions {
  removeClassNames?: Array<string>;
  removeProperty?: Array<string>;
}

function postcssPluginRemoveClassNames(options: {} = {}): Plugin {
  const { removeClassNames = [], removeProperty = [] }: PostcssPluginRemoveClassNamesOptions = options;
  let selectorRegexp: RegExp | null = null,
    propertyParamsRegexp: RegExp | null = null;

  if (removeClassNames.length) {
    selectorRegexp = new RegExp(`^\\.(${ removeClassNames.join('|') })$`);
  }

  if (removeProperty.length) {
    propertyParamsRegexp = new RegExp(`${ removeProperty.join('|') }`);
  }

  return {
    postcssPlugin: 'postcss-plugin-remove-classnames',

    Rule(rule: Rule, helper: Helpers): void {
      if (rule.type === 'rule' && selectorRegexp && selectorRegexp.test(rule.selector.trim())) {
        rule.remove();
      }
    },

    AtRule(atRule: AtRule, helper: Helpers): void {
      if (
        atRule.type === 'atrule'
        && atRule.name === 'property'
        && propertyParamsRegexp
        && propertyParamsRegexp.test(atRule.params)
      ) {
        atRule.remove();
      }
    }
  };
}

export default postcssPluginRemoveClassNames;