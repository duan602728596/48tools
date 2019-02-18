/* reducers */
import { combineReducers } from 'redux-immutable';
import index from '../modules/Index/store/reducer';

const reducers: Object = {
  ...index
};

/* 创建reducer */
export function createReducer(asyncReducers: Object): Function {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}