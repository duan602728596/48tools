/**
 * 异步加载模块
 *
 * @flow
 */
import * as React from 'react';
import { lazy, Suspense } from 'react';
import { injectReducers } from '../store/store';
import SwitchLoading from '../assembly/SwitchLoading/index';

const Fallback: React.Node = <SwitchLoading />;

/**
 * 异步加载、注入模块和reducer
 * @param { Function } loader: 需要异步注入的模块
 */
function asyncModule(loader: Function): Function {
  const Module: Function = lazy(loader);

  return (): React.Node => (
    <Suspense fallback={ Fallback }>
      <Module injectReducers={ injectReducers } />
    </Suspense>
  );
}

export default asyncModule;