import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  inLiveList: Array
} = {
  inLiveList: []
};

/* Action */
export const inLiveList: Function = createAction('官方源直播抓取列表');

/* reducer */
const reducer: Function = handleActions({
  [inLiveList]: (state: Object, action: Object): Object=>{
    return state.set('inLiveList', action.payload.inLiveList);
  }
}, fromJS(initData));

export default {
  inLive48: reducer
};