import React, { Component } from 'react';
import { injectReducers } from '../store/store';

/* 显示模块 */
class Bundle extends Component{
  state: {
    module: ?Function
  };
  constructor(): void{
    super(...arguments);
    this.state = {
      module: null
    };
  }
  componentWillMount(): void{
    this.load(this.props);
  }
  componentWillReceiveProps(nextProps: Object): void{
    if(nextProps.load !== this.props.load){
      this.load(nextProps);
    }
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
  render(): ?Object{
    if(!this.state.module){
      return null;
    }else{
      return this.props.children(this.state.module);
    }
  }
}

export default Bundle;