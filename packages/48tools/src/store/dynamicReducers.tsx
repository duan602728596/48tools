import { useMemo, type ReactElement, type FunctionComponent } from 'react';
import type { Reducer } from '@reduxjs/toolkit';
import type { Saga } from 'redux-saga';
import type { replaceReducers, runSagas } from './store';

type InjectComponent = FunctionComponent<{ replaceReducers: typeof replaceReducers }>;
type DecorateComponentFactory = (Component: FunctionComponent<any>) => InjectComponent;

interface ComponentProps {
  replaceReducers: typeof replaceReducers;
  runSagas: typeof runSagas;
}

/**
 * 异步注入reducer的修饰器
 * @param { Array<Record<string, Reducer>> } reducers
 * @param { Array<Saga> } [sagas]
 */
function dynamicReducers(reducers: Array<Record<string, Reducer>>, sagas?: Array<Saga>): DecorateComponentFactory {
  let needInject: boolean = true;
  let needRunSaga: boolean = !!sagas?.length;

  return function(Component: FunctionComponent<any>): InjectComponent {
    return function(props: ComponentProps): ReactElement {
      useMemo(function(): void {
        if (needInject) {
          props.replaceReducers(reducers);
          needInject = false;
        }

        if (needRunSaga && sagas?.length) {
          props.runSagas(sagas);
          needRunSaga = false;
        }
      }, []);

      return <Component { ...props } />;
    };
  };
}

export default dynamicReducers;