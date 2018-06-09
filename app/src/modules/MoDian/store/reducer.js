import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  modianList: Immutable.List
} = {
  modianList: List([])
};

/* Action */
export const modianList: Function = createAction('摩点项目查询列表');

/* reducer */
const reducer: Function = handleActions({
  [modianList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('modianList', List(action.payload.modianList));
  }
}, fromJS(initData));

export default {
  modian: reducer
};