import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = fromJS({
  cutList: [],
  cutMap: new Map()
});

/* Action */
export const cutList = createAction('剪切队列');  // 是否开启测试功能

/* reducer */
const reducer = handleActions({
  [cutList]: (state, action)=>{
    return state.set('cutList', action.payload.cutList);
  }
}, initData);

export default {
  cut: reducer
};