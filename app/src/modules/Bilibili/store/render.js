import { handleActions, combineActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { getAction, putAction } from 'indexeddb-tools-redux';
import { objectToArray } from '../../../function';
import option from '../../pubmicMethod/option';

/* 使用immutable初始化基础数据 */
const initData = fromJS({
  liveList: []
});

/* Action */
const opt = {
  name: option.indexeddb.name,
  version: option.indexeddb.version,
  objectStoreName: option.indexeddb.objectStore.liveCache.name
};
export const getliveList = getAction(opt);  // 获取id
export const putliveList = putAction(opt);  // 更新id

/* reducer */
const reducer = handleActions({
  [getliveList]: (state, action)=>{
    return state;
  }
}, initData);

export default {
  bilibili: reducer
};