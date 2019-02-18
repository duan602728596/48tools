import { createAction, handleActions } from 'redux-actions';
import { fromJS, List } from 'immutable';

/* 使用immutable初始化基础数据 */
const initData: {
  avList: Immutable.List
} = {
  avList: List([])
};

/* Action */
export const avList: Function = createAction('B站视频下载列表');

/* reducer */
const reducer: Function = handleActions({
  [avList]: ($$state: Immutable.Map, action: Object): Immutable.Map => {
    return $$state.set('avList', List(action.payload.avList));
  }
}, fromJS(initData));

export default {
  avDownload: reducer
};