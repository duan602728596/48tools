/* 异步加载模块 */
import React, { Component } from 'react';
import Loadable from 'react-loadable';
import { injectReducers } from '../store/store';
import SwitchLoading from '../assembly/SwitchLoading/index';

/**
 * 异步加载、注入模块和reducer
 * @param { Function } loader: 需要异步注入的模块
 */
function asyncModule(loader: Function): React.Element{
  return Loadable({
    loader,
    loading: SwitchLoading,
    render(Module: Object, props: Object): React.Element{
      const AsyncModule: Function = Module.default;
      /* 异步注入reducer */
      if('reducer' in Module){
        injectReducers(Module.reducer);
      }
      return (
        <AsyncModule { ...props } />
      );
    }
  });
}

export default asyncModule;