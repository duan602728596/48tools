import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { getAction, addAction, putAction } from 'indexeddb-tools-redux';
import { objectToArray } from '../../../function';
import option from '../../publicMethod/option';
import indexReducer, * as indexAction from './index';

/* 使用immutable初始化基础数据 */
const initData: {
  index: Object,
  time: number,
  humans: Array
} = {
  index: {},
  time: 1,
  humans: []
};

/* Action */
const opt: {
  name: string,
  version: number,
  objectStoreName: string
} = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.liveCatch.name
};
export const getAutoRecordingOption: Function = getAction(opt);  // 获取自动录制配置
export const addAutoRecordingOption: Function = addAction(opt);  // 添加自动录制配置
export const putAutoRecordingOption: Function = putAction(opt);  // 更新自动录制配置

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: (state: Object, action: Object): Object=>{
    return state.set('index', indexReducer(state.get('index'), action));
  }
}, fromJS(initData));

export default {
  liveCatch: reducer
};