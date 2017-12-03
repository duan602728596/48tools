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
export const cutList: Function = createAction('剪切队列');      // 剪切队列
export const taskChange: Function = createAction('剪切任务');   // 剪切任务

/* reducer */
const reducer: Function = handleActions({
  [cutList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('cutList', action.payload.cutList);
  },
  [taskChange]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('cutList', action.payload.cutList)
      .set('cutMap', action.payload.cutMap);
  }
}, fromJS(initData));

export default {
  cut: reducer
};