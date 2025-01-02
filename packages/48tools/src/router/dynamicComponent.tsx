import { lazy, Suspense, type ReactElement, type LazyExoticComponent, type ComponentType } from 'react';
import { Spin } from 'antd';
import { replaceReducers, runSagas } from '../store/store';

export type LoaderReturn<T = any> = Promise<{ default: ComponentType<T> }>
type Loader<T = any> = () => LoaderReturn<T>;

const Loading: ReactElement = (
  <div className="pt-[220px] text-center">
    <Spin size="large" />
  </div>
);

/**
 * 异步加载、注入模块和reducer
 * @param { Loader } loader - 需要异步注入的模块
 * @param { boolean } displayFallback - 是否显示loading
 */
function dynamicComponent<T = any>(loader: Loader<T>, displayFallback: boolean = true): () => ReactElement {
  const Component: any = lazy(loader) as LazyExoticComponent<ComponentType<T>>;

  return (): ReactElement => (
    <Suspense fallback={ displayFallback ? Loading : null }>
      <Component replaceReducers={ replaceReducers } runSagas={ runSagas } />
    </Suspense>
  );
}

export default dynamicComponent;