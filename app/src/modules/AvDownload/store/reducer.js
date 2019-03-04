import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData = {
  avList: List([])
};

/* Action */
export const avList = createAction('B站视频下载列表');

/* reducer */
const reducer = handleActions({
  [avList]: ($$state, action) => {
    return $$state.set('avList', List(action.payload.avList));
  }
}, fromJS(initData));

export default {
  avDownload: reducer
};