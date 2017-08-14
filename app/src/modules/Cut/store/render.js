// @flow
import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  cutList: Array,
  cutMap: Map
} = {
  cutList: [],
  cutMap: new Map()
};

/* Action */
export const cutList: Function = createAction('剪切队列');  // 是否开启测试功能

/* reducer */
const reducer: Function = handleActions({
  [cutList]: (state: Object, action: Object): Object=>{
    return state.set('cutList', action.payload.cutList);
  }
}, fromJS(initData));

export default {
  cut: reducer
};