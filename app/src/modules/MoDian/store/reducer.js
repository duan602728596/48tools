import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  modianList: {
    id: string,
    title: string
  }[]
} = {
  modianList: []
};

/* Action */
export const modianList: Function = createAction('摩点项目查询列表');

/* reducer */
const reducer: Function = handleActions({
  [modianList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('modianList', action.payload.modianList);
  }
}, fromJS(initData));

export default {
  modian: reducer
};