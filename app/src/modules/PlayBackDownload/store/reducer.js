// @flow
import { createAction, handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData: {
  index: Object,
  downloadList: Map,
  fnReady: boolean
} = {
  index: {},
  downloadList: new Map(),   // 下载列表
  fnReady: false             // 函数是否已绑定
};

/* Action */
export const downloadList: Function = createAction('下载列表');
export const fnReady: Function = createAction('下载监听函数初始化');

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state: Object, action: Object): Object=>{
    return state.set('index', indexReducer(state.get('index'), action));
  },
  [downloadList]: (state: Object, action: Object): Object=>{
    return state.set('downloadList', action.payload.downloadList);
  },
  [fnReady]: (state: Object, action: Object): Object=>{
    return state.set('fnReady', action.payload.fnReady);
  }
}, fromJS(initData));

export default {
  playBackDownload: reducer
};