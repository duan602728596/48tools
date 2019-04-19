import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = {
  cutList: List([]),
  cutMap: new Map()
};

/* Action */
export const cutList = createAction('剪切队列'); // 剪切队列
export const taskChange = createAction('剪切任务'); // 剪切任务

/* reducer */
const reducer = handleActions({
  [cutList]: ($$state, action) => {
    return $$state.set('cutList', List(action.payload.cutList));
  },
  [taskChange]: ($$state, action) => {
    return $$state.set('cutList', List(action.payload.cutList))
      .set('cutMap', action.payload.cutMap);
  }
}, fromJS(initData));

export default {
  cut: reducer
};