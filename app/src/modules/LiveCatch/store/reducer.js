import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { objectToArray } from '../../../function';
import option from '../../../components/option/option';
import indexReducer, * as indexAction from './index';
import { db } from '../../../components/indexedDB/initIndexedDB';

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
  objectStoreName: string
} = {
  objectStoreName: option.indexeddb.objectStore.liveCatch.name
};
export const getAutoRecordingOption: Function = db.getAction(opt);  // 获取自动录制配置
export const addAutoRecordingOption: Function = db.addAction(opt);  // 添加自动录制配置
export const putAutoRecordingOption: Function = db.putAction(opt);  // 更新自动录制配置

/* reducer */
const reducer: Function = handleActions({
  [combineActions(...objectToArray(indexAction))]: ($$state: Immutable.Map, action: Object): Immutable.Map=>{
    return $$state.set('index', indexReducer($$state.get('index'), action));
  }
}, fromJS(initData));

export default {
  liveCatch: reducer
};