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
    this.setState({
      module: null
    });
    /* 异步注入模块 */
    props.load((module: { default: Function } | Function): void=>{
      this.setState({
        module: module.default ? module.default : module
      });
    });
    /* 异步注入reducer */
    if(props.asyncReducer){
      props.asyncReducer((reducer: { default: Object } | Object): void=>{
        injectReducers(reducer.default ? reducer.default : reducer);
      });
    }
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