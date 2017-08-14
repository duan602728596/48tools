// @flow
import React, { Component } from 'react';

/* 异步加载模块 */
class Bundle extends Component{
  state: {
    module: ?Function
  };
  constructor(props: Object): void{
    super(props);
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
    props.load((module: { default: Function } | Function): void=>{
      this.setState({
        module: module.default ? module.default : module
      });
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