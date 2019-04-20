import { createAction, handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData = {
  index: {},
  downloadList: new Map() // 下载列表
};

/* Action */
export const downloadList = createAction('下载列表');

/* reducer */
const reducer = handleActions({
  [combineActions(...Object.values(indexAction))]: ($$state, action) => {
    return $$state.set('index', indexReducer($$state.get('index'), action));
  },
  [downloadList]: ($$state, action) => {
    return $$state.set('downloadList', action.payload.downloadList);
  }
}, fromJS(initData));

export default {
  playBackDownload: reducer
};