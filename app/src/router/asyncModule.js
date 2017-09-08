// @flow
/* 异步加载模块 */
import React, { Component } from 'react';
import Bundle from './bundle';

/***
 * 异步加载、注入模块和reducer
 * @param { Function } module               需要异步注入的模块
 * @param { Function | null } asyncReducer  需要异步注入的reducer
 */
function asyncModule(module: Function, asyncReducer: ?Function): Function{
  return (): Object=>(
    <Bundle load={ module } asyncReducer={ asyncReducer }>
      { (M)=><M /> }
    </Bundle>
  );
}

export default asyncModule;