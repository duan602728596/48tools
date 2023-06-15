import { useMemo, type ReactElement, type FunctionComponent } from 'react';
import type { Reducer } from '@reduxjs/toolkit';
import type { replaceReducers } from './store';

type InjectComponent = FunctionComponent<{ replaceReducers: typeof replaceReducers }>;
type DecorateComponentFactory = (Component: FunctionComponent<any>) => InjectComponent;

/**
 * 异步注入reducer的修饰器
 * @param { Array<Record<string, Reducer>> } reducers
 */
function dynamicReducers(reducers: Array<Record<string, Reducer>>): DecorateComponentFactory {
  let needInject: boolean = true;

  return function(Component: FunctionComponent<any>): InjectComponent {
    return function(props: { replaceReducers: typeof replaceReducers }): ReactElement {
      useMemo(function(): void {
        if (needInject) {
          props.replaceReducers(reducers);
          needInject = false;
        }
      }, []);

      return <Component { ...props } />;
    };
  };
}

export default dynamicReducers;