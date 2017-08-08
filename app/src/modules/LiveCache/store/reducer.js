import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { getAction, addAction, putAction } from 'indexeddb-tools-redux';
import { objectToArray } from '../../../function';
import option from '../../pubmicMethod/option';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData = fromJS({
  index: {},
  time: 1,
  humans: []
});

/* Action */
const opt = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.liveCache.name
};
export const getAutoRecordingOption = getAction(opt);  // 获取自动录制配置
export const addAutoRecordingOption = addAction(opt);  // 添加自动录制配置
export const putAutoRecordingOption = putAction(opt);  // 更新自动录制配置

/* reducer */
const reducer = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state, action)=>{
    return state.set('index', indexReducer(state.get('index'), action));
  }
}, initData);

export default {
  liveCache: reducer
};