/* 异步注入reducer的修饰器 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * @param { Object } reducer
 */
function loadReducer(reducer: Object): Function{
  /**
   * @param { Function } Module: 需要修饰的模块
   */
  return function(Module: Function): void{
    return class extends Component{
      static propTypes: Object = {
        injectReducers: PropTypes.func
      };

      constructor(): void{
        super(...arguments);

        // 异步注入reducer
        const injectReducers: Function = this?.props?.injectReducers || null;

        if(injectReducers){
          injectReducers(reducer);
        }
      }
      render(): React.Element{
        return <Module />;
      }
    };
  };
}

export default loadReducer;