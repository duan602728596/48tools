// @flow
/* reducers */
import { combineReducers } from 'redux-immutable';
import index from '../modules/Index/store/reducer';

const reducers: Object = {
  ...index
};

/* 创建reducer */
export function createReducer(asyncReducer: Object): Function{
  return combineReducers({
    ...reducers,
    ...asyncReducer
  });
}