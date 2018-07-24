import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectReducers } from '../store/store';

/* 显示模块 */
class Bundle extends Component{
  state: {
    module: ?Function
  };

  static propTypes: Object = {
    load: PropTypes.func,
    children: PropTypes.func
  };

  constructor(): void{
    super(...arguments);
    this.state = {
      module: null
    };
  }
  componentDidMount(): void{
    this.load(this.props);
  }
  load(props: Object): void{
    // es6 module
    props.load((module: { default: Function, reducer: ?Object }): void=>{
      /* 异步注入模块 */
      this.setState({
        module: module.default
      });

      /* 异步注入reducer */
      if('reducer' in module){
        injectReducers(module.reducer);
      }
    });
  }
  render(): React.Element{
    return this.props.children(this.state.module ? this.state.module : null);
  }
}

export default Bundle;