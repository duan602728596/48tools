import React, { Component } from 'react';

/* 异步加载模块 */
class Bundle extends Component{
  constructor(props){
    super(props);
    this.state = {
      module: null
    };
  }
  componentWillMount(){
    this.load(this.props);
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.load !== this.props.load){
      this.load(nextProps);
    }
  }
  load(props){
    this.setState({
      module: null
    });
    props.load((module)=>{
      this.setState({
        module: module.default ? module.default : module
      });
    });
  }
  render(){
    if(!this.state.module){
      return false;
    }else{
      return this.props.children(this.state.module);
    }
  }
}

export default Bundle;