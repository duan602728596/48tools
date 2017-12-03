import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  wdsList: {
    id: string,
    title: string
  }[]
} = {
  wdsList: []
};

/* Action */
export const wdsList: Function = createAction('微打赏查询列表');

/* reducer */
const reducer: Function = handleActions({
  [wdsList]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('wdsList', action.payload.wdsList);
  }
}, fromJS(initData));

export default {
  wds: reducer
};