// @flow
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  test: boolean
} = {
  test: false
};

/* Action */
export const test: Function = createAction('是否开启测试功能');  // 是否开启测试功能

/* reducer */
const reducer: Function = handleActions({
  [test]: (state: Object, action: Object): Object=>{
    return state.set('test', action.payload.test);
  }
}, fromJS(initData));

export default {
  index: reducer
};