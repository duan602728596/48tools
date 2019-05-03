import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import option from '../../../components/option/option';
import indexReducer, * as indexAction from './index';
import { db } from '../../../components/indexedDB/initIndexedDB';

/* 使用immutable初始化基础数据 */
const initData = {
  index: {},
  time: 1,
  humans: []
};

/* Action */
const opt = {
  objectStoreName: option.indexeddb.objectStore.liveCatch.name
};

export const getAutoRecordingOption = db.getAction(opt); // 获取自动录制配置
export const addAutoRecordingOption = db.addAction(opt); // 添加自动录制配置
export const putAutoRecordingOption = db.putAction(opt); // 更新自动录制配置

/* reducer */
const reducer = handleActions({
  [combineActions(...Object.values(indexAction))]: ($$state, action) => {
    return $$state.set('index', indexReducer($$state.get('index'), action));
  }
}, fromJS(initData));

export default {
  liveCatch: reducer
};