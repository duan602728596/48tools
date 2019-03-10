import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = {
  inLiveList: List([])
};

/* Action */
export const inLiveList = createAction('官方源直播抓取列表');

/* reducer */
const reducer = handleActions({
  [inLiveList]: ($$state, action) => {
    return $$state.set('inLiveList', List(action.payload.inLiveList));
  }
}, fromJS(initData));

export default {
  inLive48: reducer
};