// @flow
/* 异步加载模块 */
import React, { Component } from 'react';
import Bundle from './bundle';

function asyncModule(module: Function): Function{
  return (): Object=>(
    <Bundle load={ module }>
      { (M)=><M /> }
    </Bundle>
  );
}

export default asyncModule;