import { useMemo } from 'react';
import { bindActionCreators } from 'redux';
import { useDispatch } from 'react-redux';

/**
 * react-redux hooks创建action函数
 * @param { object | Function } actions
 * @param { Array<any> } deps
 */
function useActions(actions, deps) {
  const dispatch = useDispatch();

  return useMemo(function() {
    if (typeof actions === 'function') {
      return actions(dispatch);
    }

    return bindActionCreators(actions, dispatch);
  }, deps ? [dispatch, ...deps] : deps);
}

export default useActions;