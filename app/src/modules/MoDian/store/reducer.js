import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = {
  modianList: List([])
};

/* Action */
export const modianList = createAction('摩点项目查询列表');

/* reducer */
const reducer = handleActions({
  [modianList]: ($$state, action) => {
    return $$state.set('modianList', List(action.payload.modianList));
  }
}, fromJS(initData));

export default {
  modian: reducer
};