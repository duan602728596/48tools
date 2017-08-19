/* 异常捕获 */
import React, { Component } from 'react';

class ErrorBoundary extends Component{
  state: {
    hasError: boolean,
    errorInfo: any
  };
  constructor(props): void{
    super(props);

    this.state = {
      hasError: false,
      errorInfo: ''
    };
  }
  componentDidCatch(error: any, info: any): void{
    this.setState({
      hasError: true,
      errorInfo: info
    });
  }
  render(): Object{
    if(this.state.hasError){
      return(
        <div>
          <h3>Error</h3>
          <pre>{ this.state.errorInfo }</pre>
        </div>
      );
    }else{
      return this.props.children;
    }
  }
}

export default ErrorBoundary;
