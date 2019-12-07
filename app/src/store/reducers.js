import { combineReducers } from 'redux-immutable';
import indexReducer from '../pages/Index/reducer/reducer';

/* reducers */
const reducers = {
  ...indexReducer
};

/* 创建reducer */
export function createReducer(asyncReducers) {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}