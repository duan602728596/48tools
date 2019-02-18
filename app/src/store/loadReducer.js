/**
 * 异步注入reducer的修饰器
 *
 * @flow
 */
import * as React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * @param { Object } reducer
 */
function loadReducer(reducer: Object): Function {
  /**
   * @param { Function } Module: 需要修饰的模块
   */
  return function(Module: Function): Function {
    return class extends Component<{ injectReducers: Function }> {
      static propTypes: Object = {
        injectReducers: PropTypes.func
      };

      constructor(): void {
        super(...arguments);

        // 异步注入reducer
        const injectReducers: ?Function = this?.props?.injectReducers || null;

        if (injectReducers) {
          injectReducers(reducer);
        }
      }
      render(): React.Node {
        return <Module />;
      }
    };
  };
}

export default loadReducer;